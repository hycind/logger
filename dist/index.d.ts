import express from 'express';

export const HttpLogger: (req: any, res: any, next: any) => express.RequestHandler;
export namespace Logger {
    export function silly(msg?: string, meta?: any): void;
    export function debug(msg?: string, meta?: any): void;
    export function info(msg?: string, meta?: any): void;
    export function warn(msg?: string, meta?: any): void;
    export function error(msg?: string, meta?: any): void;
}