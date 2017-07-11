import test from 'ava'

import createHealthCheck, { wrap } from './check'

test('wraps boolean', async t => {
  const isTrue = await wrap(true)()
  const isFalse = await wrap(true)()
  t.true(isTrue, 'when true')
  t.true(isFalse, 'when false')
})

test('wraps function', async t => {
  const syncAdd = (x, y) => x + y
  const syncResult = await wrap(syncAdd)(7, 20)
  t.is(syncResult, 27, 'when sync')

  const asyncAdd = async (x, y) => x + y
  const asyncResult = await wrap(asyncAdd)(5, 2)
  t.is(asyncResult, 7, 'when async')
})

test('wraps wrapped function', async t => {
  const add = (x, y) => x + y
  const wrappedAdd = wrap(add)
  const result = await wrappedAdd(3, 9)
  t.is(result, 12, 'when sync')

  const asyncAdd = async (x, y) => x + y
  const asyncResult = await wrap(asyncAdd)(5, 2)
  t.is(asyncResult, 7, 'when async')
})

test('wraps object', async t => {
  const syncHealth = {health: (a, b) => a + b}
  const syncResult = await wrap(syncHealth)('x', 'y')
  t.is(syncResult, 'xy', 'when sync')

  const asyncHealth = {health: async (a, b) => a + b}
  const asyncResult = await wrap(asyncHealth)('a', 'b')
  t.is(asyncResult, 'ab', 'when async')
})

test('does not wraps objects without health', async t => {
  const msg = /object missing health/i
  const foo = {notHealth: () => 'x'}
  t.throws(() => wrap(foo), msg)
})

test('does not wrap unsupported types', async t => {
  const msg = /cannot create health/i
  t.throws(() => wrap(2), msg, 'when number')
  t.throws(() => wrap('foo'), msg, 'when string')
})

test('checks health', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const healthy = await healthCheck(true)
  const unhealthy = await healthCheck(false)

  t.deepEqual(healthy, ({
    failures: 0,
    attempts: 1,
    healthy: true,
    errors: [],
    error: null
  }), 'when healthy')

  const error = new Error('Health check returned untrue.')
  t.deepEqual(unhealthy, ({
    failures: 1,
    attempts: 2,
    healthy: false,
    errors: [error],
    error
  }), 'when unhealthy')
})

test('checks health in parallel', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const status = [true, false, false, true, false]
  const healths = await Promise.all(status.map(healthCheck))
  t.deepEqual(healths.map(({healthy}) => healthy), status)
  t.is(
    healths.map(({attempts}) => attempts).reduce((x, y) => Math.max(x, y)),
    5
  )
})

test('checks health and returns unhealthy when not true', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})

  const stringHealth = await healthCheck(() => '')
  t.false(stringHealth.healthy, 'when non-empty string')

  const emptyStringHealth = await healthCheck(() => '')
  t.false(emptyStringHealth.healthy, 'when empty string')

  const unityHealth = await healthCheck(() => 1)
  t.false(unityHealth.healthy, 'when unity')
})

test('checks health and does not overflow attempts', async t => {
  const healthCheck = createHealthCheck(x => x, {maxAttempts: 2, cache: null})
  await healthCheck(true)
  await healthCheck(true)
  await healthCheck(true)
  await healthCheck(false)
  const { attempts, failures } = await healthCheck(true)
  t.is(attempts, 2)
  t.is(failures, 1)
})

test('checks health and keeps error history', async t => {
  const healthCheck = createHealthCheck((() => {
    let x = 0
    return () => {
      x++
      throw new Error(x)
    }
  })(), {errorHistory: 3, cache: null})

  for (let i = 1; i < 6; i++) await healthCheck()
  const { error, errors } = await healthCheck()

  t.deepEqual(error, new Error(6))
  t.deepEqual(errors, [
    new Error(6),
    new Error(5),
    new Error(4)
  ])
})

test('checks health and caches by ttl', async t => {
  const healthCheck = createHealthCheck(x => x, {ttl: 1})

  for (let i = 0; i < 5; i++) await healthCheck(true)
  const cachedHealth = await healthCheck(false)

  t.deepEqual(cachedHealth, {
    failures: 0,
    attempts: 6,
    healthy: true,
    errors: [],
    error: null
  })

  await new Promise(resolve => setTimeout(resolve, 1100))

  const { healthy, failures, attempts } = await healthCheck(false)
  t.false(healthy)
  t.is(attempts, 7)
  t.is(failures, 1)
})
