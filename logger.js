/**
 * Configurations of logger.
 */
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

const consoleConfig = [
    new winston.transports.Console({
        colorize: true
    })
];

const createLogger = new winston.Logger({
    transports: consoleConfig
});

const infoLogger = createLogger;
infoLogger.add(winstonRotator, {
    name: 'access-file',
    level: 'info',
    filename: './logs/exchange.log',
    json: false,
    datePattern: 'yyyy-MM-dd-',
    prepend: true
});

module.exports = {
    infolog: infoLogger
};
