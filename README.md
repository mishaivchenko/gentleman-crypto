# Crypto Telegram Bot a.k.a Gentleman-crypto

# Crypto Telegram Bot

## Description
Crypto Telegram Bot is an automated cryptocurrency analysis bot that uses APIs from cryptocurrency exchanges (such as Binance), news aggregators (NewsAPI, Twitter), and the LLaMA model to process and analyze data. The bot generates charts with technical analysis indicators, analyzes news, and sends reports to Telegram.

## Key Features
- Fetch historical cryptocurrency data via Binance API.
- Generate charts based on technical analysis indicators: RSI, EMA, MACD.
- News analysis using LLaMA and other sources.
- Generate reports and send analysis results in the form of messages and charts to Telegram.
- Prediction system based on historical data and pattern analysis.
- Supports multiple cryptocurrencies.

## Technology Stack
- **Node.js** — main runtime environment.
- **Telegram Bot API** — for sending messages and interacting with users.
- **Chart.js** — for generating charts.
- **Binance API** — for fetching historical cryptocurrency data.
- **OpenAI / LLaMA API** — for news analysis and generating predictions.
- **NewsAPI/Twitter API** — for fetching news data.
- **Canvas** — for image and chart generation.
- **PDFKit** — for generating PDF reports.

## Installation and Setup
1. Clone the project from GitHub:

    ```bash
    git clone https://github.com/yourusername/crypto-telegram-bot.git
    ```

2. Navigate to the project directory:

    ```bash
    cd crypto-telegram-bot
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file with your API keys and settings:

    ```bash
    touch .env
    ```

   Example `.env` file content:

    ```plaintext
    TELEGRAM_API_KEY=your-telegram-api-key
    BINANCE_API_KEY=your-binance-api-key
    OPENAI_API_KEY=your-openai-api-key
    NEWS_API_KEY=your-news-api-key
    ```

5. Start the bot:

    ```bash
    npm start
    ```

## Project Structure
    ├── charts/                 # Generated charts
    ├── reports/                # Generated PDF reports
    ├── services/               # Services for API work and data processing
    │   ├── binance.js          # Work with Binance API
    │   ├── chart.js            # Chart generation
    │   ├── indicators.js       # Calculation of RSI, EMA, MACD indicators
    │   ├── news.js             # Work with NewsAPI and Twitter API
    │   ├── ollama.js           # Interaction with LLaMA
    │   ├── pdf.js              # PDF report generation
    │   ├── telegram.js         # Interaction with Telegram API
    │   ├── twitter.js          # Work with Twitter API
    ├── titles/                 # Store news headlines for analysis
    ├── .env                    # Environment settings (API keys)
    ├── index.js                # Main bot entry point
    ├── package.json            # Project dependencies file
    ├── README.md               # Project documentation


## Task Breakdown

### Architectural Tasks:
- Implement CI/CD pipeline (GitHub Actions) for automatic build and testing.
- Create a database to store historical pattern data (backtesting).

### Features:
- Add support for analyzing new technical analysis indicators.
- Implement prediction functionality based on historical patterns.

### Fixes:
- Improve data analysis performance.
- Resolve issues when working with the news API.

### UI/UX:
- Improve the display of charts and reports.
- Add interactive query options within Telegram.

## How to Contribute
If you would like to contribute to the project, you can fork the repository, make changes, and submit a pull request. Any feedback or suggestions for improvements are also highly appreciated.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.