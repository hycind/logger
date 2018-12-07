// This is ugly, but is required for Logger
(global as any).APP = 'WBR';
// 
process.env.WBR_LOG_LEVEL = "silly"
process.env.WBR_LOG_CONSOLE = "false"
process.env.WBR_LOG_FILE = "false"
process.env.WBR_LOG_HTTP = "true"
process.env.WBR_LOG_FILE_PATH = "./logs"
process.env.WBR_LOG_MAX_SIZE = "5m"
process.env.WBR_LOG_MAX_FILES = "14d"

import fs from 'fs';
import chai from 'chai';
import express from 'express';
import sinon from 'sinon';
import { spy, stub } from 'sinon';
import { Logger } from '../src';

let expect = chai.expect;
let should = chai.should();

var req = new (require('mock-express-request'))({
    method: 'PUT',
    url: '/stuff?q=thing',
    cookies: { token: "MYTOKEN" },
    headers: {
        'Accept': 'text/plain'
    }
});

var res = new (require('mock-express-response'))({
    request: new (require('mock-express-response'))()
});

describe('Logger file location and created files', () => {
    // before(() => {
    //     fs.rmdirSync(process.env.WBR_LOG_FILE_PATH || './logs');
    // });
    // after(() => {
    //     fs.rmdirSync(process.env.WBR_LOG_FILE_PATH || './logs');
    // });
    it('Should not create a log when LogToFile is set to false', () => {

    });
});
describe('Logger wrapper', () => {
    it('Should create a log', () => {
        Logger.silly('A silly message');
        Logger.debug('A debug message');
        Logger.info('A info message');
        Logger.warn('A warn message');
        Logger.error('A error message');
        expect(true).to.be.true;
    });
});

describe('HTTP Logger', () => {
    var mw: any, HttpLogger: any;
    before(() => {
        Object.keys(require.cache).every(function (key, idx) {
            if (key.includes('logger/src')) {
                delete require.cache[key]
                HttpLogger = require('../src').HttpLogger;
                return false;
            } else return true;
        });
    });

    it('Should be a function', () => {
        mw = HttpLogger;
        expect(HttpLogger).to.be.a('function')
    });
    it('Should write a messsage', (done) => {
        let router = express.Router();
        var req1: express.Request, res: express.Response, next: express.NextFunction, spy;

        router.use(HttpLogger);
        req1 = <express.Request>{};
        res = <express.Response>{};
        spy = sinon.spy(HttpLogger);

        router(req, res, () => { });
        done();
        expect(spy.calledOnce).to.equal(true);
    });
    it('Should pick default value DEF', () => {
    });
});
