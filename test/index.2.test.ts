// This is ugly, but is required for Logger
(global as any).APP = 'WBR'
process.env.ACE_WBR_LOG_LEVEL = 'error'
import chai from 'chai';
import path from 'path';
import express from 'express';
import sinon from 'sinon';
import { spy, stub } from 'sinon';

let expect = chai.expect;
let should = chai.should();

var req = (options = {}) => ({
    body: {},
    cookies: {},
    query: {},
    params: {},
    get: stub(),
    ...options
});
var res = (options = {}) => {
    const res: any = {
        cookie: spy(),
        clearCookie: spy(),
        download: spy(),
        format: spy(),
        json: spy(),
        jsonp: spy(),
        send: spy(),
        sendFile: spy(),
        sendStatus: spy(),
        redirect: spy(),
        render: spy(),
        end: spy(),
        set: spy(),
        type: spy(),
        get: stub(),
        ...options
    }
    res.status = stub().returns(res)
    res.vary = stub().returns(res)
    return res;
}

describe('HTTPLogger reload import', () => {
    var HttpLogger: any;
    before(() => {
        (global as any).APP = undefined;
        Object.keys(require.cache).every(function (key, idx) {
            if (key.includes('logger/src')) {
                delete require.cache[key]
                HttpLogger = require('../src').HttpLogger;
                return false
            } else return true;
        });
    });
    it('should pick default value', () => {
        let newmw = HttpLogger;
        console.log('initia')
    });
}); 