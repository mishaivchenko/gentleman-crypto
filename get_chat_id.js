require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Инициализируем бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Отслеживаем все сообщения
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(`Your chat ID: ${chatId}`);
    bot.sendMessage(chatId, `Ваш chat ID: ${chatId}`);
});