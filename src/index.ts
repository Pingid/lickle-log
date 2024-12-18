/**
 * Represents a logger with configurable context and transport mechanisms.
 * This logger allows for different levels of logging and customization of the
 * logging behavior through context and transport mechanisms.
 */
export interface Logger<T extends Record<string, any> = Record<string, any>> {
  /**
   * Configures the logger with custom transport and/or context.
   * @example
   * // Configure the global logger
   * import { configure } from '@lickle/log'
   * configure({ transport: (log)  => ... })
   */
  configure: <C extends Record<string, any> = {}>(config?: { meta?: C } & Partial<Config<T & C>>) => void
  /**
   * Extends the current logger metadata. This is useful for adding context-specific information
   * to logs that can help in debugging or tracing log entries.
   * @example
   * logger.meta({ requestId: '12345' });
   * logger.info`Processing request.`; // { msg: 'Processing request.', meta: { requestId: '12345' } }
   */
  meta: (meta: Record<string, any>, replace?: boolean) => void
  /**
   * Logs a fatal-level message. Use this for unrecoverable system errors.
   * @example
   * logger.log`System crash; application will terminate.`;
   */
  log: Log

  /**
   * Logs an error-level message. Ideal for runtime errors or unexpected conditions.
   * @example
   * logger.error`Failed to load user data for user id ${userId}.`;
   */
  error: Log

  /**
   * Logs a warning-level message. Use this for undesirable situations that are not errors.
   * @example
   * logger.warn`Deprecated API usage in module "authService".`;
   */
  warn: Log

  /**
   * Logs an info-level message. Good for tracking the flow of the application under normal operation.
   * @example
   * logger.info`User ${user.name} has logged in.`;
   */
  info: Log

  /**
   * Logs a debug-level message. Useful for detailed debugging information.
   * @example
   * logger.debug`Fetching user list from database.`;
   */
  debug: Log
}

export interface Log {
  /** Logging with template literals for interpolated strings. */
  (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): void
  /** Logging with additional metadata for structured logging. */
  (meta: Record<string, any>): {
    (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): void
  }
  /** Logging with simple message strings without interpolation. */
  (message: string | number | null | boolean): void
}

export type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug'
type Transport<T extends Record<string, any> = { [x: string]: any }> = (log: {
  level: LogLevel
  msg: string
  meta?: T
}) => void

type Config<T extends Record<string, any>> = { meta?: T; transport: Transport<T> }

export const defaultTransport: Transport = (log) => {
  const m = { ...log, time: new Date().toISOString() }
  if (log.level in console) (console as any)[log.level](m)
  else console.log(m)
}

export const create = <C extends Record<string, any> = {}>(config?: Partial<Config<C>>): Logger<C> => {
  let _config = {
    meta: config?.meta,
    transport: config?.transport ?? defaultTransport,
  }

  const template = (a: any, subs?: any[]) =>
    String.raw(a as any, ...(subs ?? []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))))

  const log = (level: LogLevel, a: any, subs?: any[]): any => {
    let lg = { level, msg: '' }

    if (Array.isArray(a) && Array.isArray((a as any).raw)) {
      lg.msg = template(a, subs)
    } else if (typeof a === 'string') lg.msg = a
    else if (typeof a === 'object' && !Array.isArray(a) && a !== null) {
      return create({ ..._config, meta: { ..._config?.meta, ...a } })[level]
    } else lg.msg = JSON.stringify(a)

    if (_config.meta) (lg as any).meta = _config.meta
    _config.transport(lg)
  }

  const logger: Logger<C> = {
    configure: (c) => {
      _config = { ..._config, ...c } as any
    },
    meta: (x, replace) => {
      console.log(`replace: ${replace}`, config?.meta)
      if (!x && !(_config as any).meta) return
      if (replace) (_config as any).meta = x
      else _config.meta = { ..._config.meta, ...x } as any
    },
    log: (t, ...subs) => log('log', t, subs),
    error: (t, ...subs) => log('error', t, subs),
    warn: (t, ...subs) => log('warn', t, subs),
    info: (t, ...subs) => log('info', t, subs),
    debug: (t, ...subs) => log('debug', t, subs),
  }
  return logger
}

const defaultLogger: Logger = create({})

export const configure: Logger['configure'] = defaultLogger.configure
export const meta: Logger['meta'] = defaultLogger.meta
export const log: Logger['log'] = defaultLogger.log
export const error: Logger['error'] = defaultLogger.error
export const warn: Logger['warn'] = defaultLogger.warn
export const info: Logger['info'] = defaultLogger.info
export const debug: Logger['debug'] = defaultLogger.debug

export default defaultLogger
