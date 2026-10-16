const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '..', 'logs');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志保留天数
const LOG_RETENTION_DAYS = process.env.LOG_RETENTION_DAYS || '3d';

// 文件日志格式 - 紧凑但详细的JSON
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式 - 人类可读，带颜色和结构化信息
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, module, ...meta }) => {
    const svc = module || service || '';
    const metaStr = Object.keys(meta).length > 0 && !meta.stack
      ? ' ' + JSON.stringify(meta)
      : '';
    return `${timestamp} ${level}: [${svc}] ${message}${metaStr}`;
  })
);

// 日志传输器
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),

  // 全量日志（按日轮转，保留3天）
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: LOG_RETENTION_DAYS,
    level: 'info',
    format: fileFormat,
  }),

  // 错误日志（按日轮转，保留3天）
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: LOG_RETENTION_DAYS,
    level: 'error',
    format: fileFormat,
  }),

  // 调试日志（仅开发环境，按日轮转，保留3天）
  new DailyRotateFile({
    filename: path.join(logDir, 'debug-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: LOG_RETENTION_DAYS,
    level: 'debug',
    format: fileFormat,
    silent: process.env.NODE_ENV === 'production',
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  defaultMeta: { service: 'wu-chenfei-checkin' },
  transports,
  exitOnError: false,
});

module.exports = logger;
