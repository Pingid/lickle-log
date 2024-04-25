/**
 * Represents a logger with configurable context and transport mechanisms.
 * This logger allows for different levels of logging and customization of the
 * logging behavior through context and transport mechanisms.
 */
export interface Logger<T extends Record<string, any> = {}> {
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
   * logger.extend({ requestId: '12345' });
   * logger.info`Processing request.`; // Includes requestId in the log meta
   */
  extend: (meta: Record<string, any>) => void
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
  time: string
  msg: string
  meta?: T
}) => void

type Config<T extends Record<string, any>> = { meta?: T; transport: Transport<T> }

export const create = <C extends Record<string, any> = {}>(config?: Partial<Config<C>>): Logger<C> => {
  let _config = {
    meta: config?.meta,
    transport:
      config?.transport ?? ((log) => (log.level in console ? (console as any)[log.level](log) : console.log(log))),
  }

  const template = (a: any, subs?: any[]) =>
    String.raw(a as any, ...(subs ?? []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))))

  const log = (level: LogLevel, a: any, subs?: any[]): any => {
    const time = new Date().toISOString()
    let lg = { level, time, msg: '' }

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
    extend: (x) => {
      _config.meta = { ..._config.meta, ...x } as any
    },
    log: (t, ...subs) => log('log', t, subs),
    error: (t, ...subs) => log('error', t, subs),
    warn: (t, ...subs) => log('warn', t, subs),
    info: (t, ...subs) => log('info', t, subs),
    debug: (t, ...subs) => log('debug', t, subs),
  }
  return logger
}

const logger: Logger<{}> = create({})

export const configure = logger.configure
export const extend = logger.extend
export const log = logger.log
export const error = logger.error
export const warn = logger.warn
export const info = logger.info
export const debug = logger.debug

export default logger