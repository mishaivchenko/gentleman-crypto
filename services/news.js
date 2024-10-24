const axios = require('axios');

async function getCombinedNews(symbol) {
    try {
        // Получаем новости с обоих источников
        const newsAPIResults =  []; //await getNewsFromNewsAPI(symbol);
        const cryptoPanicResults = await getNewsFromCryptoPanic(symbol);
        //const twitterNews = await searchTwitterNews(symbol);

        // Объединяем результаты в один список
        return [...newsAPIResults, ...cryptoPanicResults];
    } catch (error) {
        console.error(`Ошибка при объединении новостей для ${symbol}:`, error.message);
        return [`Ошибка при объединении новостей для ${symbol}.`];
    }
}

// Функция для получения новостей по символу актива
async function getNewsFromNewsAPI(symbol) {
    const apiKey = process.env.NEWS_API_KEY;

    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${symbol} cryptocurrency&language=en&apiKey=${apiKey}`);

        // Преобразуем ответ в нужную структуру
        return response.data.articles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt
        }));
    } catch (error) {
        console.error(`Ошибка при получении новостей через NewsAPI для ${symbol}:`, error.message);
        return [`Ошибка при получении новостей для ${symbol}.`]; // Возвращаем заглушку при ошибке
    }
}

async function getNewsFromCryptoPanic(symbol) {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;

    try {
        const response = await axios.get(`https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&currencies=${symbol}`);

        // Преобразуем ответ в нужную структуру
        return response.data.results.slice(0, 5).map(post => ({
            title: post.title,
            description: post.body,
            url: post.url,
            source: post.source.title,
            publishedAt: post.published_at
        }));
    } catch (error) {
        console.error(`Ошибка при получении новостей через CryptoPanic для ${symbol}:`, error.message);
        return [`Ошибка при получении новостей для ${symbol}.`]; // Возвращаем заглушку при ошибке
    }
}

module.exports = { getCombinedNews };