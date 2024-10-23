const fs = require('fs');
const PDFDocument = require('pdfkit');

// Функция для создания PDF отчета
async function createPDF(content, filePath, symbol) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Подключаем собственный шрифт
            doc.registerFont('ArialUnicode', './arial-unicode-ea.ttf'); // Укажи путь к скачанному шрифту

            // Создаем поток записи в файл
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Устанавливаем шрифт
            doc.font('ArialUnicode');

            // Заголовок отчета
            doc.fontSize(18)
                .text(`Отчет по активу: ${symbol}`, {
                    align: 'center'
                })
                .moveDown(2); // Увеличенный отступ

            // Разделитель
            doc.moveTo(50, 100)
                .lineTo(550, 100)
                .stroke()
                .moveDown(2);

            // Записываем основной контент в PDF
            const lines = content.split('\n');  // Разделяем текст на строки

            lines.forEach(line => {
                if (line.startsWith('Ссылка:')) {
                    // Форматируем ссылки
                    const url = line.split('Ссылка: ')[1].trim();
                    doc.fontSize(12)
                        .fillColor('blue')
                        .text('Ссылка на статью:', { underline: true })
                        .text(url, { link: url, underline: true })
                        .moveDown();
                } else if (line.startsWith('Анализ:')) {
                    // Форматируем заголовки "Анализ"
                    doc.fontSize(14)
                        .fillColor('black')
                        .text(line, {
                            align: 'justify',
                            indent: 30
                        })
                        .moveDown(1);
                } else if (line.trim()) {
                    // Форматируем обычный текст
                    doc.fontSize(12)
                        .fillColor('black')
                        .text(line, {
                            align: 'justify',
                            indent: 30
                        })
                        .moveDown(0.5);
                }
            });

            // Завершаем создание PDF
            doc.end();

            stream.on('finish', resolve);
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {createPDF};