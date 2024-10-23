const axios = require('axios');

// Функция для анализа новостей с использованием OpenAI
async function analyzeNews(symbol, news) {
    const apiKey = process.env.OPENAI_API_KEY; // Убедись, что API-ключ правильный

    // Формируем подробный промпт для анализа всех данных
    const prompt = `
    Ты — финансовый аналитик. Тебе даны новости о криптовалюте ${symbol}. 
    Вот список новостей:
    ${news.map(n => `Заголовок: ${n.title}\nОписание: ${n.description}\nСсылка: ${n.url}`).join('\n\n')}
    
    Задача:
    1. Изучи информацию по ссылкам. Открой каждую и возьми интересную и необходимую информацию и отфильтруй нерелевантные или устаревшие данные.
    2. Оставь только информацию, которая заслуживает внимания и важна для понимания текущего положения дел по активу ${symbol}.
    3. Сделай оценку каждой новости и укажи, почему она важна или не важна.
    4. В конце каждой новости оставь ссылку, чтобы можно было перейти и прочитать оригинал.
    
    Ответ должен быть лаконичным и структурированным.
  `;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a financial analyst specialized in cryptocurrencies." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content; // Возвращаем результат анализа
    } catch (error) {
        console.error(`Ошибка при анализе новостей для ${symbol}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { analyzeNews };