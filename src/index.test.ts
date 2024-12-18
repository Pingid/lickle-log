import { expect, it, vi, afterEach, beforeEach } from 'vitest'

import log from './index.js'

const transport = vi.fn()

beforeEach(() => void log.configure({ transport, meta: undefined }))
afterEach(() => void transport.mockClear())

vi.useFakeTimers()
const def = { time: new Date().toISOString(), level: 'debug' as const, msg: 'Test' }

it('should available levels', () => {
  const levels = ['log', 'error', 'warn', 'info', 'debug'] as const
  levels.forEach((level) => log[level]`Test`)
  const result = levels.map((level) => ({ ...def, level }))
  expect(transport.mock.calls.flat()).toEqual(result)
})

it(`should handle extending meta at log level`, () => {
  log.meta({ a: 'b' })
  log.debug({ c: 'd' })`Test`
  expect(transport.mock.calls.flat()).toEqual([{ ...def, meta: { a: 'b', c: 'd' } }])
})

it(`should handle basic string`, () => {
  log.debug('Test')
  expect(transport.mock.calls.flat()).toEqual([def])
})
