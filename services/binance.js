const axios = require('axios');
const crypto = require('crypto');

// Функция для подписи запроса
function sign(queryString, secretKey) {
    return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

// Функция для получения основной цены актива (например, BNB для LDBNB)
function getUnderlyingAssetPrice(symbol, prices) {
    if (symbol.startsWith('LD')) {
        const underlyingSymbol = symbol.substring(2); // Удаляем префикс LD
        return prices[`${underlyingSymbol}USDT`] || 0;
    }
    return prices[`${symbol}USDT`] || 0;
}

// Функция для получения символа актива без префикса LD
function getCleanSymbol(symbol) {
    return symbol.startsWith('LD') ? symbol.substring(2) : symbol;
}

// Функция для получения списка активов с сортировкой по цене
async function getAssets() {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;

    // Создаем таймстамп
    const timestamp = Date.now();

    // Параметры запроса
    const queryString = `timestamp=${timestamp}`;

    // Подписываем запрос
    const signature = sign(queryString, apiSecret);

    try {
        // Получаем баланс активов
        const accountResponse = await axios({
            method: 'GET',
            url: `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        // Получаем цены активов
        const priceResponse = await axios({
            method: 'GET',
            url: 'https://api.binance.com/api/v3/ticker/price',
        });

        const prices = priceResponse.data.reduce((acc, priceObj) => {
            acc[priceObj.symbol] = parseFloat(priceObj.price);
            return acc;
        }, {});

        // Фильтруем активы с ненулевыми балансами
        return accountResponse.data.balances
            .filter(asset => parseFloat(asset.free) > 0)
            .map(asset => {
                // Получаем цену актива или его базовой валюты (например, для LDBNB — это цена BNB)
                const price = getUnderlyingAssetPrice(asset.asset, prices);
                // Получаем символ актива без префикса LD
                const cleanSymbol = getCleanSymbol(asset.asset);
                return {
                    symbol: cleanSymbol, // Используем символ без префикса LD
                    amount: parseFloat(asset.free),
                    price: price,
                    isEarnAccount: asset.asset.startsWith('LD'), // Флаг, если это актив Binance Earn
                };
            })
            .filter(asset => asset.price * asset.amount > 100)
            .sort((a, b) => b.price * b.amount - a.price * a.amount) // Сортируем активы по цене в убывающем порядке
            .slice(0, 5);
    } catch (error) {
        console.error('Ошибка при получении активов:', error.message);
        throw error;
    }
}

async function getHistoricalData(symbol, interval = '1d', limit = 100) {
    const formattedSymbol = `${symbol.toUpperCase()}USDT`;
    const url = `https://api.binance.com/api/v3/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;

    try {
        const response = await axios.get(url);
        return response.data.map(candle => ({
            openTime: candle[0],
            close: parseFloat(candle[4]),
        }));
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error.message);
        throw error;
    }
}


module.exports = { getAssets, getHistoricalData };