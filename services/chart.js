const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const width = 800; // ширина холста
const height = 600; // высота холста
const chartCallback = (ChartJS) => {
    // Здесь можно настроить глобальные параметры графика, например, плагины
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function generateMultiChart(symbol, historicalData, indicators) {
    const dates = historicalData.map(item => new Date(item.openTime).toLocaleDateString());
    const closePrices = historicalData.map(item => item.close);
    const rsi = indicators.rsi.slice(-closePrices.length);
    const ema = indicators.ema.slice(-closePrices.length);
    const macdLine = indicators.macd.map(item => item.MACD);
    const signalLine = indicators.macd.map(item => item.signal);
    const macdHistogram = indicators.macd.map(item => item.histogram);

    // Конфигурация для Chart.js
    const configuration = {
        type: 'line',
        data: {
            labels: dates,
            datasets: [],
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Date' } },
            },
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: `${symbol} - Multi-level Chart`,
                },
            },
        },
    };

    const closeAndEmaDataset = {
        labels: dates,
        datasets: [
            {
                label: 'Close Prices',
                data: closePrices,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'EMA',
                data: ema,
                borderColor: 'green',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    const rsiDataset = {
        labels: dates,
        datasets: [
            {
                label: 'RSI',
                data: rsi,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                borderDash: [5, 5],
            },
        ],
    };

    const macdDataset = {
        labels: dates,
        datasets: [
            {
                label: 'MACD Line',
                data: macdLine,
                borderColor: 'red',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Signal Line',
                data: signalLine,
                borderColor: 'purple',
                borderWidth: 2,
                fill: false,
                borderDash: [5, 5],
            },
            {
                label: 'MACD Histogram',
                data: macdHistogram,
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                type: 'bar',
                yAxisID: 'y2',
                fill: true,
            },
        ],
    };

    // Создание каждого графика
    const chartCloseAndEMA = await chartJSNodeCanvas.renderToBuffer({
        ...configuration,
        data: closeAndEmaDataset,
    });
    const chartRSI = await chartJSNodeCanvas.renderToBuffer({
        ...configuration,
        data: rsiDataset,
    });
    const chartMACD = await chartJSNodeCanvas.renderToBuffer({
        ...configuration,
        data: macdDataset,
    });

    // Сохраняем изображения графиков
    fs.writeFileSync(path.join(__dirname, `../charts/${symbol}_close_ema_chart.png`), chartCloseAndEMA);
    fs.writeFileSync(path.join(__dirname, `../charts/${symbol}_rsi_chart.png`), chartRSI);
    fs.writeFileSync(path.join(__dirname, `../charts/${symbol}_macd_chart.png`), chartMACD);

    return {
        closeAndEmaChartPath: path.join(__dirname, `../charts/${symbol}_close_ema_chart.png`),
        rsiChartPath: path.join(__dirname, `../charts/${symbol}_rsi_chart.png`),
        macdChartPath: path.join(__dirname, `../charts/${symbol}_macd_chart.png`),
    };
}

module.exports = { generateMultiChart };