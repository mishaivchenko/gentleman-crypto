# Базовый образ с Node.js
FROM node:18-buster

#RUN apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Устанавливаем Python и другие зависимости для сборки canvas
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    g++ \
    pkg-config

# Директория в контейнере для приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --build-from-source

RUN npm cache clean --force

# Копируем исходный код
COPY . .

# Порт, который будет использовать контейнер
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]



# Используем минимизированный базовый образ Node.js
#FROM node:18-alpine
#
## Устанавливаем зависимости для сборки canvas
#RUN apk add --no-cache \
#    libcairo-dev \
#    pango-dev \
#    jpeg-dev \
#    giflib-dev \
#    librsvg-dev \
#    g++ \
#    make \
#    python3
#
## Директория для приложения
#WORKDIR /app
#
## Копируем package.json и устанавливаем production-зависимости
#COPY package*.json ./
#RUN npm install --production --build-from-source \
#    && npm cache clean --force
#
## Копируем исходный код
#COPY . .

# Указываем переменные окружения (опционально, если используете ENV в Dockerfile)
# ENV TELEGRAM_API_KEY=your_telegram_key
# ENV BINANCE_API_KEY=your_binance_key
# ENV BINANCE_SECRET_KEY=your_binance_secret
# ENV NEWS_API_KEY=your_newsapi_key

# Открываем порт для контейнера
#EXPOSE 3000
#
## Команда для запуска приложения
#CMD ["npm", "start"]