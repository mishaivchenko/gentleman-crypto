require('dotenv').config();

const {getAssets, getHistoricalData} = require('./services/binance');
const {getCombinedNews} = require('./services/news');
//const { analyzeNews } = require('./services/openai');
const {analyzeNews} = require('./services/ollama');
//const {createPDF} = require('./services/pdf');
const {sendChartToTelegram, sendFullReportToTelegram, sendBriefReportToTelegram} = require('./services/telegram');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('cron');
const fs = require('fs');
const path = require('path');
const {getIndicators} = require("./services/indicators");

// Инициализируем бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// Основная функция для сбора данных и анализа

async function runAnalysis(chatId) {
    try {
        const assets = await getAssets();

        let fullReport = `📊 *Daily Crypto News Analysis test* 📊\n\n`;

        for (let asset of assets) {
            const news = await getCombinedNews(asset.symbol);

            const importantNews = filterNews(news);
            const newNews = filterNewTitles(asset.symbol, importantNews);

            if (newNews.length === 0) {
                console.log(`Новых важных новостей для ${asset.symbol} не найдено.`);
                continue;
            }

            console.log(`Найдено ${newNews.length} важных новостей для ${asset.symbol}.`);

            const data = await getHistoricalData(asset.symbol, interval = '1d', limit = 300);
            const indicators = await getIndicators(data);
            // Отправляем новости на анализ в OpenAI
            const analysis = await analyzeNews(asset.symbol, newNews, data, indicators );
            //await createPDF(analysis, filePath, asset.symbol);

            // Отправляем отчет в Telegram
            await sendBriefReportToTelegram(asset.symbol, analysis, chatId);

            // Формируем блок для каждой монеты
            //fullReport += `🔹 *${asset.symbol} News*:\n`;
            //fullReport += `${analysis}\n\n`;  // Добавляем анализ новостей для монеты

            await sendChartToTelegram(chatId, asset.symbol, data, indicators, news);
        }

        bot.sendMessage(chatId, 'Отчет успешно отправлен!');
        //await sendFullReportToTelegram( escapeMarkdownV2(fullReport), chatId);

    } catch (error) {
        console.error('Ошибка при выполнении анализа:', error.message);
        bot.sendMessage(chatId, 'Произошла ошибка при выполнении анализа.');
    }
}

function escapeMarkdownV2(text) {
    return text
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-')
        .replace(/=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/\./g, '\\.')   // Экранируем точки
        .replace(/!/g, '\\!');
}

function filterNews(news) {
    const fundamentalKeywords = ['regulation', 'partnership', 'update', 'development', 'technology', 'integration'];
    const speculativeKeywords = ['price', 'volatility', 'capital flow', 'whale', 'dump', 'pump'];

    return news.filter(article => {
        const content = `${article.title} ${article.description}`.toLowerCase();

        // Проверяем на наличие ключевых слов
        const isFundamental = fundamentalKeywords.some(keyword => content.includes(keyword));
        const isSpeculative = speculativeKeywords.some(keyword => content.includes(keyword));

        return isFundamental || isSpeculative; // Возвращаем только важные новости
    });
}

// Функция для создания директории, если она не существует
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {recursive: true});
    }
}

// Функция для чтения прошлых заголовков
function readProcessedTitles(symbol) {
    const directoryPath = path.join(__dirname, 'titles');
    const filePath = path.join(directoryPath, `${symbol}_titles.json`);

    // Проверяем и создаем директорию, если её нет
    ensureDirectoryExists(directoryPath);

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }

    return []; // Если файла нет, возвращаем пустой массив
}

// Функция для записи заголовков в файл
function writeProcessedTitles(symbol, titles) {
    const directoryPath = path.join(__dirname, 'titles');
    const filePath = path.join(directoryPath, `${symbol}_titles.json`);

    // Проверяем и создаем директорию, если её нет
    ensureDirectoryExists(directoryPath);

    fs.writeFileSync(filePath, JSON.stringify(titles, null, 2), 'utf-8');
}

// Функция для фильтрации новых заголовков
function filterNewTitles(symbol, news) {
    const processedTitles = readProcessedTitles(symbol);
    const newNews = news.filter(article => !processedTitles.includes(article.title));

    // Обновляем список обработанных заголовков
    const updatedTitles = [...processedTitles, ...newNews.map(article => article.title)];
    writeProcessedTitles(symbol, updatedTitles);

    return newNews;
}


// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Используй команду /get_report, чтобы получить криптоотчет, или жди отчета по расписанию.');
});

// Обработка команды /get_report для запуска анализа вручную
bot.onText(/\/get_report/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Запускаю сбор данных и анализ...');
    runAnalysis(chatId);
});

// Планирование отчета по расписанию — каждый день в 9 утра
const scheduledJob = new cron.CronJob('0 9 * * *', () => {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    bot.sendMessage(chatId, 'Запускаю ежедневный анализ данных...');
    runAnalysis(chatId);
}, null, true, 'Europe/Kiev');


scheduledJob.start();