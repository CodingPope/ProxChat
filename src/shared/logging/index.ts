type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMetadata = {
  error?: unknown;
  [key: string]: unknown;
};

export type ScopedLogger = {
  debug: (message: string, meta?: LogMetadata) => void;
  info: (message: string, meta?: LogMetadata) => void;
  warn: (message: string, meta?: LogMetadata) => void;
  error: (message: string, meta?: LogMetadata) => void;
};

const normalizeMetadata = (meta?: LogMetadata) => {
  if (!meta) {
    return undefined;
  }

  const { error, ...rest } = meta;
  if (!error) {
    return Object.keys(rest).length ? rest : undefined;
  }

  if (error instanceof Error) {
    return {
      ...rest,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    };
  }

  return { ...rest, error };
};

const emitLog = (
  level: LogLevel,
  scope: string,
  message: string,
  meta?: LogMetadata
) => {
  const prefix = scope ? `[${scope}] ${message}` : message;
  const payload = normalizeMetadata(meta);

  switch (level) {
    case 'error':
      payload ? console.error(prefix, payload) : console.error(prefix);
      break;
    case 'warn':
      payload ? console.warn(prefix, payload) : console.warn(prefix);
      break;
    case 'debug':
      payload ? console.debug(prefix, payload) : console.debug(prefix);
      break;
    default:
      payload ? console.log(prefix, payload) : console.log(prefix);
      break;
  }
};

export const createLogger = (scope: string): ScopedLogger => ({
  debug: (message: string, meta?: LogMetadata) =>
    emitLog('debug', scope, message, meta),
  info: (message: string, meta?: LogMetadata) =>
    emitLog('info', scope, message, meta),
  warn: (message: string, meta?: LogMetadata) =>
    emitLog('warn', scope, message, meta),
  error: (message: string, meta?: LogMetadata) =>
    emitLog('error', scope, message, meta),
});

const rootLogger = createLogger('App');

export const logDebug = (message: string, meta?: LogMetadata) =>
  rootLogger.debug(message, meta);
export const logInfo = (message: string, meta?: LogMetadata) =>
  rootLogger.info(message, meta);
export const logWarn = (message: string, meta?: LogMetadata) =>
  rootLogger.warn(message, meta);
export const logError = (message: string, meta?: LogMetadata) =>
  rootLogger.error(message, meta);
