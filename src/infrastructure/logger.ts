// src/infrastructure/logger.ts
// Simple structured logger factory. Writes to stdout/stderr with ISO timestamps.

export interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

export function createLogger(): Logger {
  function format(level: string, message: string, meta?: Record<string, any>): string {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
    return meta && Object.keys(meta).length ? `${base} ${JSON.stringify(meta)}` : base;
  }

  return {
    info(message, meta?) {
      console.log(format("info", message, meta));
    },
    warn(message, meta?) {
      console.warn(format("warn", message, meta));
    },
    error(message, meta?) {
      console.error(format("error", message, meta));
    },
  };
}
