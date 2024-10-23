const axios = require('axios');

// Функция для анализа новостей с использованием LLaMA модели
async function analyzeNews(symbol, news, indicators) {
    const prompt = `
    You are a financial analyst specializing in cryptocurrencies. Your task is to provide a concise analysis of recent news and market indicators for ${symbol}.

    **News:**
    ${news.map((n, index) => `${index + 1}. ${n.title} (Impact: ${n.score}/10)`).join('\n')}
    
    **Market Indicators:**
    - RSI: ${indicators.rsi} (Moderate)
    - EMA: ${indicators.ema} (Trend)
    - MACD: ${indicators.macd}

    Provide a brief summary, focusing on the correlation between the news and indicators. Use concise, professional language. Add emojis for fun.
  `;


    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3.2",
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 1000
        }, {
            responseType: 'stream' // Указываем, что ответ приходит в виде потока данных
        });

        let finalResponse = '';

        // Обрабатываем поток частичных ответов
        response.data.on('data', (chunk) => {
            const parsedChunk = JSON.parse(chunk.toString());
            if (!parsedChunk.done) {
                finalResponse += parsedChunk.response;
                process.stdout.write(parsedChunk.response); // Выводим частичные данные сразу
            }
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                console.log('\nFinal analysis response:', finalResponse);
                resolve(finalResponse); // Возвращаем полный ответ
            });

            response.data.on('error', (error) => {
                console.error(`Error analyzing news for ${symbol}:`, error);
                reject(error);
            });
        });

    } catch (error) {
        console.error(`Error analyzing news for ${symbol}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { analyzeNews };
