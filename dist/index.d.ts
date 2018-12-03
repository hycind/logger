import express from 'express';

export const Logger: any;
export const HttpLogger: (req:any, res:any,next:any) => express.RequestHandler;