import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, meta }) =>
      `${timestamp} [${level.toUpperCase()}]: ${message}: ${
        meta ? JSON.stringify(meta) : ''
      }`
  )
);

const infoTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs', // папка для хранения логов
  filename: 'application-%DATE%.log', // шаблон имени файла
  datePattern: 'YYYY-MM-DD', // формат даты
  zippedArchive: true, // архивирование старых логов
  maxSize: '20m', // максимальный размер файла
  maxFiles: '14d', // хранить логи за 14 дней
});

const errorTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs/errors', // папка для хранения логов ошибок
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
});

export const logger = winston.createLogger({
  level: 'info', // минимальный уровень логов (info и выше)
  format: logFormat,
  transports: [infoTransport, errorTransport],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}
