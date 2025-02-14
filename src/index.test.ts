import { expect, it, vi, afterEach, beforeEach } from 'vitest'

import log, { create } from './index.js'

const transport = vi.fn()

beforeEach(() => void (log.transport = transport))
afterEach(() => void transport.mockClear())

it('should available levels', () => {
  const levels = ['log', 'error', 'warn', 'info', 'debug'] as const
  levels.forEach((level) => log[level]`Test`)
  const result = levels.map((level) => ({ msg: 'Test', level, meta: {} }))
  expect(transport.mock.calls.flat()).toEqual(result)
})

it(`should handle extending meta at log level`, () => {
  log.meta['a'] = 'b'
  log.debug({ c: 'd' })`Test`
  expect(transport.mock.calls.flat()).toEqual([{ level: 'debug', msg: 'Test', meta: { a: 'b', c: 'd' } }])
})

it(`should handle basic string`, () => {
  delete log.meta['a']
  log.debug('Test')
  expect(transport.mock.calls.flat()).toEqual([{ level: 'debug', msg: 'Test', meta: {} }])
})

it(`should handle error`, () => {
  log.error(new Error('Test', { cause: 'test' }))
  expect(transport.mock.calls.flat()).toEqual([
    {
      level: 'error',
      msg: 'Test',
      meta: { stack: expect.any(String), cause: 'test', name: 'Error' },
    },
  ])
})

it(`should create a new logger instance`, () => {
  const transport = vi.fn()
  const log = create({ meta: { a: 'b' }, transport })
  log.error`Test`
  expect(transport.mock.calls.flat()).toEqual([{ level: 'error', msg: 'Test', meta: { a: 'b' } }])
})
