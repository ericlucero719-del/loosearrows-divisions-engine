"use strict";
// src/infrastructure/logger.ts
// Simple structured logger factory. Writes to stdout/stderr with ISO timestamps.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
function createLogger() {
    function format(level, message, meta) {
        const ts = new Date().toISOString();
        const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
        return meta && Object.keys(meta).length ? `${base} ${JSON.stringify(meta)}` : base;
    }
    return {
        info(message, meta) {
            console.log(format("info", message, meta));
        },
        warn(message, meta) {
            console.warn(format("warn", message, meta));
        },
        error(message, meta) {
            console.error(format("error", message, meta));
        },
    };
}
//# sourceMappingURL=logger.js.map