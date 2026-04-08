export interface Logger {
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}
export declare function createLogger(): Logger;
//# sourceMappingURL=logger.d.ts.map