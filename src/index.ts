import fs from 'fs';
import path from 'path';
import express from 'express';
import winston from 'winston';
require('winston-daily-rotate-file');


export default class AppLogger {
    private logApplication: string = 'def';
    private logLevel: string = 'silly';
    private LogToConsole: boolean = false;
    private logToFile: boolean = false;
    private logFilePath: string = "./logs";
    private logHttp: boolean = false;
    private logMaxSize: string = '5m';
    private logMaxFiles: string = '14d';

    private $tmpLogger: winston.Logger = <winston.Logger>{};
    private $logger: winston.Logger = <winston.Logger>{};
    public get logger(): winston.Logger {
        return this.$logger;
    }

    private $httpLogger: express.RequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction): any => { };
    public get httpLogger(): express.RequestHandler {
        return this.$httpLogger;
    }

    // 
    constructor(appName: string) {
        // console.log('AppLogger/constructor()')
        if (appName === 'DEF') console.debug(`AppLogger/constructor() No app name set, using defaults`);

        this.logApplication = appName;
        this.logLevel = ['debug', 'info', 'warn', 'error'].indexOf(process.env['ACE_' + appName + '_LOG_LEVEL'] || '') >= 0 ? <string>process.env['ACE_' + appName + '_LOG_LEVEL'] : 'silly';
        this.LogToConsole = process.env['ACE_' + appName + '_LOG_CONSOLE'] === 'true' ? true : false;
        this.logToFile = process.env['ACE_' + appName + '_LOG_FILE'] === 'true' ? true : false;
        this.logFilePath = process.env['ACE_' + appName + '_LOG_FILE_PATH'] || './logs';
        this.logHttp = process.env['ACE_' + appName + '_LOG_HTTP'] === 'true' ? true : false;
        this.logMaxSize = process.env['ACE_' + appName + '_LOG_MAX_SIZE'] || '5m';
        this.logMaxFiles = process.env['ACE_' + appName + '_LOG_MAX_FILES'] || '14d';

        fs.existsSync(this.logFilePath) ? {} : fs.mkdirSync(this.logFilePath);
        this.$logger = winston.createLogger({
            level: this.logLevel,
            format: winston.format.json()
        });
        this.setTransports();
        if (this.logHttp) this.setHttpLogging();
    }

    // 
    private setTransports() {
        // console.log('AppLogger/setTransports()')
        // 
        // Console transports
        // 
        if (this.LogToConsole) this.$logger.add(new winston.transports.Console({
            format: winston.format.simple()
        }));
        // 
        // File transports
        // 
        if (this.logToFile) this.$logger.add(new ((winston.transports as any).DailyRotateFile)({
            filename: path.resolve(this.logFilePath, `${this.logApplication.toLowerCase()}_%DATE%_${this.logLevel}.log`),
            datePattern: 'YYYY-MM-DD HH:mm',
            zippedArchive: true,
            maxSize: this.logMaxSize,
            maxFiles: this.logMaxFiles,
            level: this.logLevel
        }));

    }

    // 
    private setHttpLogging() {
        this.$tmpLogger = winston.createLogger({
            format: winston.format.json(),
            transports: [
                new (winston.transports as any).DailyRotateFile({
                    filename: path.resolve(this.logFilePath, `${this.logApplication.toLowerCase()}_%DATE%_http.log`),
                    datePattern: 'YYYY-MM-DD HH:mm',
                    zippedArchive: true,
                    maxSize: this.logMaxSize,
                    maxFiles: this.logMaxFiles
                })
            ]
        });
        // 
        // Http logging
        // 
        let morgan = require('morgan')
        var os = require('os');

        morgan.token('conversation-id', function getConversationId(req: express.Request) {
            return (req as any).conversationId;
        });
        morgan.token('session-id', function getSessionId(req: express.Request) {
            return (req as any).sessionId;
        });
        morgan.token('instance-id', function getInstanceId(req: express.Request) {
            return (req as any).instanceId;
        });
        morgan.token('hostname', function getHostname() {
            return os.hostname();
        });
        morgan.token('pid', function getPid() {
            return process.pid;
        });

        this.$httpLogger = morgan((tokens: any, req: express.Request, res: express.Response) => {
            return JSON.stringify({
                'remote-address': tokens['remote-addr'](req, res),
                'time': tokens['date'](req, res, 'iso'),
                'method': tokens['method'](req, res),
                'url': tokens['url'](req, res),
                'http-version': tokens['http-version'](req, res),
                'status-code': tokens['status'](req, res),
                'content-length': tokens['res'](req, res, 'content-length'),
                'referrer': tokens['referrer'](req, res),
                'user-agent': tokens['user-agent'](req, res),
                'conversation-id': tokens['conversation-id'](req, res),
                'session-id': tokens['session-id'](req, res),
                'hostname': tokens['hostname'](req, res),
                'instance': tokens['instance-id'](req, res),
                'pid': tokens['pid'](req, res)
            });
        }, {
                stream: {
                    write: (message: string) => {
                        let msg = JSON.parse(message);
                        this.$tmpLogger.info(`${msg['status-code']} ${msg.method} ${msg.url}`, msg);
                        if (this.LogToConsole) console.log(`${msg.time} ${msg['status-code']} ${msg.method} ${msg.url}`);
                    }
                }
            }
        );
    }
}

let appLogger = new AppLogger((global as any).APP || 'DEF');
export const Logger = appLogger.logger;
export const HttpLogger = appLogger.httpLogger;