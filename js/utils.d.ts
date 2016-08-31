/// <reference types="express-serve-static-core" />
export declare function UrlJoin(...parts: string[]): string;
export declare type ExpressErrorRequestHandler = (err: any, req: Express.Request, res: Express.Response, next: Function) => void;
export declare let errorHandlers: ExpressErrorRequestHandler[];
export declare let defaultErrorLogger: (toLog: any) => void;
export declare let defaultWarnLogger: (toLog: any) => void;
export declare let defaultInfoLogger: (toLog: any) => void;
export declare function addErrorHandler(eh: ExpressErrorRequestHandler): void;
export declare function setDefaultErrorLogger(logger: (toLog: any) => void): void;
export declare function setDefaultWarnLogger(logger: (toLog: any) => void): void;
export declare function setDefaultInfoLogger(logger: (toLog: any) => void): void;
