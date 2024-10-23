const { RSI, EMA, MACD } = require('technicalindicators');

async function getIndicators(historicalData) {
    const closes = historicalData.map(data => data.close);

    if (closes.length < 30) {
        throw new Error('Недостаточно данных для расчета индикаторов. Требуется хотя бы 30 точек данных.');
    }

    const rsi = RSI.calculate({values: closes, period: 14});
    const ema = EMA.calculate({values: closes, period: 14});
    const macd = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });

    return {
        rsi,
        ema,
        macd,
    };
}

module.exports = { getIndicators };