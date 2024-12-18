import { expect, it, vi, afterEach, beforeEach } from 'vitest'

import log from './index.js'

const transport = vi.fn()

beforeEach(() => void log.configure({ transport }))
afterEach(() => void transport.mockClear())

it('should available levels', () => {
  const levels = ['log', 'error', 'warn', 'info', 'debug'] as const
  levels.forEach((level) => log[level]`Test`)
  const result = levels.map((level) => ({ msg: 'Test', level }))
  expect(transport.mock.calls.flat()).toEqual(result)
})

it(`should handle extending meta at log level`, () => {
  log.meta({ a: 'b' })
  log.debug({ c: 'd' })`Test`
  expect(transport.mock.calls.flat()).toEqual([{ level: 'debug', msg: 'Test', meta: { a: 'b', c: 'd' } }])
})

it(`should handle basic string`, () => {
  log.meta({}, true)
  log.debug('Test')
  expect(transport.mock.calls.flat()).toEqual([{ level: 'debug', msg: 'Test', meta: {} }])
})
