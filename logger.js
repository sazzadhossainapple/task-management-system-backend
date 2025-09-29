const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

const errorLogger = (uri) =>
    expressWinston.errorLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.DailyRotateFile({
                filename: 'log/log-error-%DATE%.log',
                datePattern: 'yyyy-MM-DD-HH',
            }),
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
        ),
        meta: true,
        msg: '{ "message": "{{ err.message }}", "stack": "{{ err.stack }}" }',
    });

module.exports = errorLogger;
