const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const {generateMultiChart} = require("./chart");
const fs = require('fs');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

async function sendFullReportToTelegram(report, chatId) {
    try {
        const escapedReport = report; // Экранируем символы

        // Разделяем сообщение на части, если оно превышает лимит
        const messageParts = splitMessage(escapedReport);

        // Отправляем каждую часть отдельно
        for (let part of messageParts) {
            await bot.sendMessage(chatId, part, { parse_mode: 'MarkdownV2' });
        }

        console.log('Full report successfully sent to Telegram in parts!');
    } catch (error) {
        console.error('Error sending full report to Telegram:', error.message);
    }
}

async function sendChartToTelegram(chatId, symbol, historicalData, indicators, news) {

    const { closeAndEmaChartPath, rsiChartPath, macdChartPath } = await generateMultiChart(symbol, historicalData, indicators);

    await bot.sendPhoto(chatId, fs.createReadStream(closeAndEmaChartPath), {
        caption: `📊 Here is the Close Prices and EMA chart for ${symbol}`,
    });

    await bot.sendPhoto(chatId, fs.createReadStream(rsiChartPath), {
        caption: `📊 Here is the RSI chart for ${symbol}`,
    });

    await bot.sendPhoto(chatId, fs.createReadStream(macdChartPath), {
        caption: `📊 Here is the MACD chart for ${symbol}`,
    });
}

async function sendBriefReportToTelegram(symbol, analysis, chatId) {
    try {
        // Экранируем текст перед отправкой
        let telegramMessage = `🔔 *Brief Report on ${symbol}:* \n\n`;
        telegramMessage += `${escapeMarkdown(analysis)}\n\n`;

        // Отправляем сообщение в Telegram
        await bot.sendMessage(chatId, telegramMessage, { parse_mode: 'MarkdownV2' });

        console.log('Brief report successfully sent to Telegram!');
    } catch (error) {
        console.error('Error sending brief report to Telegram:', error.message);
    }
}

function splitMessage(text, maxLength = 4096) {
    const parts = [];
    let remainingText = text;

    while (remainingText.length > maxLength) {
        // Ищем последнее пробел в пределах допустимой длины, чтобы избежать разрезания слов
        let splitIndex = remainingText.lastIndexOf(' ', maxLength);
        if (splitIndex === -1) {
            splitIndex = maxLength; // Если не находим пробела, просто разрезаем на maxLength
        }

        const part = remainingText.slice(0, splitIndex);
        parts.push(part);

        // Оставляем остаток текста для следующего разделения
        remainingText = remainingText.slice(splitIndex).trim();
    }

    // Добавляем последний кусок текста
    if (remainingText.length > 0) {
        parts.push(remainingText);
    }

    return parts;
}

function escapeMarkdown(text) {
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
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/!/g, '\\!');
}


module.exports = { sendFullReportToTelegram, sendBriefReportToTelegram, sendChartToTelegram };
