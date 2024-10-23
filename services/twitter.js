const Twitter = require('twitter-v2');
const axios = require('axios');
// Инициализация клиента Twitter с использованием Bearer Token
const twitterClient = new Twitter({
    bearer_token: process.env.BEARER_TOKEN // Используйте только Bearer Token
});

// Функция для поиска новостей в Twitter
async function searchTwitterNews(symbol) {
    try {
        const response = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`, // Используйте ваш токен здесь
            },
            params: {
                'query': `${symbol}`,
                'max_results': 10,
                'tweet.fields': 'author_id,created_at,text',
            }
        });

        return response.data.data.map(tweet => ({
            title: `Tweet by ${tweet.author_id}`,
            description: tweet.text,
            url: `https://twitter.com/${tweet.author_id}/status/${tweet.id}`,
            created_at: tweet.created_at
        }));
    } catch (error) {
        console.error(`Error searching Twitter for ${symbol}:`, error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = { searchTwitterNews };