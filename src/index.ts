/**
 * Represents a logger with configurable context and transport mechanisms.
 * This logger allows for different levels of logging and customization of the
 * logging behavior through context and transport mechanisms.
 */
export interface Logger<T extends Record<string, any> = Record<string, any>> {
  /**
   * The metadata associated with the logger. Useful for adding context-specific information
   * to logs messages.
   * @example
   * logger.meta.requestId = '12345';
   * logger.info`Processing request.`; // { msg: 'Processing request.', meta: { requestId: '12345' } }
   */
  meta: T

  /**
   * The transport function that outputs logs.
   * @example
   * logger.transport = (log) => {
   *   console.log(`[${log.level.toUpperCase()}] ${log.msg}`, log.meta);
   * };
   */
  transport: Transport<T>

  /**
   * Logs a message.
   * @example
   * logger.log`System crash; application will terminate.`;
   */
  log: Log

  /**
   * Logs an error-level message.
   * @example
   * logger.error`Failed to load user data for user id ${userId}.`;
   */
  error: Log

  /**
   * Logs a warning-level message.
   * @example
   * logger.warn`Deprecated API usage in module "authService".`;
   */
  warn: Log

  /**
   * Logs an info-level message.
   * @example
   * logger.info`User ${user.name} has logged in.`;
   */
  info: Log

  /**
   * Logs a debug-level message.
   * @example
   * logger.debug`Fetching user list from database.`;
   */
  debug: Log
}

export interface Log {
  /**
   * Logs a message using template literals with interpolated strings.
   * @example
   * logger.log`Processing request with id ${requestId}`;
   */
  (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): void

  /**
   * Logs a message with additional metadata for structured logging.
   * @example
   * logger.log({ requestId: '12345' })`Processing request.`;
   */
  (meta: Record<string, any>): {
    (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): void
    (message: string | number | null | boolean | Error): void
  }

  /**
   * Logs a simple message without interpolation.
   * @example
   * logger.log('Application started successfully.');
   */
  (message: string | number | null | boolean | Error): void
}

export type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug'

export type Transport<T extends Record<string, any> = { [x: string]: any }> = (log: {
  level: LogLevel
  msg: string
  meta?: T
}) => void

const defaultTransport: Transport = (log) => {
  const m = { ...log, time: new Date().toISOString() }
  if (log.level in console) (console as any)[log.level](m)
  else console.log(m)
}

/**
 * Creates a new logger instance with the specified configuration.
 * @param config - The configuration for the logger.
 * @example
 * const logger = create({
 *   transport: (log) => {
 *     if (process.env.NODE_ENV === 'dev') return console.log(log);
 *     if (log.level === 'debug' && process.env.DEBUG) return console.log(log);
 *     if (log.level === 'error') sendToServer(log);
 *     console.log(log);
 *   },
 * });
 * @returns A new logger instance.
 */
export const create = <C extends Record<string, any> = Record<string, any>>(config?: {
  meta?: C
  transport?: Transport<C>
}): Logger<C> => {
  const template = (a: any, subs?: any[]) =>
    String.raw(a as any, ...(subs ?? []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))))

  const log = (level: LogLevel, a: any, subs?: any[]): any => {
    let lg: any = { level, msg: '' }

    // Handle template literals
    if (Array.isArray(a) && Array.isArray((a as any).raw)) {
      lg.msg = template(a, subs)
    }

    // Handle string
    else if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean' || a === null) lg.msg = a
    // Handle error
    else if (a instanceof Error) {
      lg.msg = a.message
      lg.meta = { ...logger.meta, stack: a.stack }
      if (a.cause) lg.meta.cause = a.cause
      if (a.name) lg.meta.name = a.name
    }
    // Handle object
    else if (typeof a === 'object' && !Array.isArray(a) && a !== null) {
      return create({ transport: logger.transport, meta: { ...logger?.meta, ...a } })[level]
    }
    // Handle everything else
    else lg.msg = JSON.stringify(a)

    if (logger.meta && !lg.meta) lg.meta = logger.meta
    logger.transport(lg)
  }

  const logger: Logger<C> = {
    transport: config?.transport ?? defaultTransport,
    meta: (config?.meta ?? {}) as C,
    log: (t, ...subs) => log('log', t, subs),
    error: (t, ...subs) => log('error', t, subs),
    warn: (t, ...subs) => log('warn', t, subs),
    info: (t, ...subs) => log('info', t, subs),
    debug: (t, ...subs) => log('debug', t, subs),
  }
  return logger
}

const defaultLogger: Logger = create({})

export default defaultLogger
