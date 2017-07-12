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

  t.deepEqual(healthy, {
    healthy: true,
    cached: false,
    error: null
  }, 'when healthy')

  t.deepEqual(unhealthy, {
    healthy: false,
    cached: false,
    error: new Error('Health check returned untrue.')
  }, 'when unhealthy')
})

test('checks health when unhealthy', async t => {
  const error = new Error('On fire!')
  const healthCheck = createHealthCheck(x => { throw error })
  const health = await healthCheck()
  t.deepEqual(health, {healthy: false, cached: false, error})
})

test('checks health in parallel', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const status = [true, false, false, true, false]
  const healths = await Promise.all(status.map(healthCheck))
  t.deepEqual(healths.map(({healthy}) => healthy), status)
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

test('checks health and caches by ttl', async t => {
  const healthCheck = createHealthCheck(x => x, {ttl: 1})

  const health = await healthCheck(true)
  for (let i = 0; i < 5; i++) await healthCheck(true)
  const cachedHealth = await healthCheck(false)

  await new Promise(resolve => setTimeout(resolve, 1100))
  const { healthy, cached } = await healthCheck(false)

  t.deepEqual(health, {healthy: true, error: null, cached: false})
  t.deepEqual(cachedHealth, {healthy: true, error: null, cached: true})
  t.false(healthy)
  t.false(cached)
})

test('checks health with null cache', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const health = await healthCheck(true)
  const { healthy, cached } = await healthCheck(true)
  t.deepEqual(health, {healthy: true, error: null, cached: false})
  t.true(healthy)
  t.false(cached)
})
