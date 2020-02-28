import test from 'ava'
import { sleeP } from '@meltwater/phi'

import createHealthCheck, { createSyncCheck, defaultError, wrap } from './check'

/* default */

test('checks health when healthy', async t => {
  const healthCheck = createHealthCheck(true)
  const health = await healthCheck()
  t.deepEqual(health, { healthy: true, cached: false, error: null })
})

test('checks health when unhealthy', async t => {
  const healthCheck = createHealthCheck(false)
  const health = await healthCheck()
  const error = new Error(defaultError)
  t.deepEqual(health, { healthy: false, cached: false, error })
})

test('checks health when unhealthy on error', async t => {
  const error = new Error('On fire!')
  const healthCheck = createHealthCheck(x => { throw error })
  const health = await healthCheck()
  t.deepEqual(health, { healthy: false, cached: false, error })
})

test('checks health in parallel', async t => {
  const healthCheck = createHealthCheck(x => x, { cache: null })
  const status = [true, false, false, true, false]
  const healths = await Promise.all(status.map(healthCheck))
  t.deepEqual(healths.map(({ healthy }) => healthy), status)
})

test('checks health for nested checks', async t => {
  const healthCheck = createHealthCheck(createHealthCheck(x => x))
  const health = await healthCheck(true)
  t.deepEqual(health, { healthy: true, cached: false, error: null })
})

test('checks health for nested checks and preserves cache and error', async t => {
  const error = new Error(defaultError)
  const healthCheck = createHealthCheck(createHealthCheck(x => x), { cache: null })
  const initialHealth = await healthCheck(false)
  const health = await healthCheck(true)
  t.deepEqual(initialHealth, { healthy: false, cached: false, error })
  t.deepEqual(health, { healthy: false, cached: true, error })
})

test('checks health for nested checks with class factory function', async t => {
  class Foo {
    constructor (x) {
      this.x = x
    }

    async health () {
      return this.x
    }
  }

  const createFoo = (...args) => new Foo(...args)
  const healthCheck = createHealthCheck(
    createHealthCheck(createFoo, { ttl: 5 }),
    { ttl: 1 }
  )
  const initialHealth = await healthCheck(true)
  await sleeP(1100)
  const health = await healthCheck(false)
  t.deepEqual(initialHealth, { healthy: true, cached: false, error: null })
  t.deepEqual(health, { healthy: true, cached: true, error: null })
})

test('checks health for object factory function', async t => {
  const createFoo = x => ({ health: x => x })
  const healthCheck = createHealthCheck(createFoo)
  const health = await healthCheck(true)
  t.deepEqual(health, { healthy: true, cached: false, error: null })
})

test('checks health for class factory function', async t => {
  class Foo {
    constructor (x) {
      this.x = x
    }

    async health () {
      return this.x
    }
  }

  const createFoo = (...args) => new Foo(...args)
  const healthCheck = createHealthCheck(createFoo)
  const health = await healthCheck(true)
  t.deepEqual(health, { healthy: true, cached: false, error: null })
})

test('checks health and returns unhealthy when not true', async t => {
  const healthCheck = createHealthCheck(x => x, { cache: null })

  const stringHealth = await healthCheck(() => '')
  t.false(stringHealth.healthy, 'when non-empty string')

  const emptyStringHealth = await healthCheck(() => '')
  t.false(emptyStringHealth.healthy, 'when empty string')

  const unityHealth = await healthCheck(() => 1)
  t.false(unityHealth.healthy, 'when unity')
})

test('checks health and times out', async t => {
  const healthCheck = createHealthCheck(() => sleeP(300), { timeout: 100 })
  const health = await healthCheck()
  const error = new Error('Health check timed out after 100 ms')
  t.deepEqual(health, { healthy: false, cached: false, error })
})

test('checks health and caches by ttl', async t => {
  const healthCheck = createHealthCheck(x => x, { ttl: 1 })

  const health = await healthCheck(true)
  for (let i = 0; i < 5; i++) await healthCheck(true)
  const cachedHealth = await healthCheck(false)

  await sleeP(1100)
  const { healthy, cached } = await healthCheck(false)

  t.deepEqual(
    health,
    { healthy: true, error: null, cached: false },
    'where first value is not cached'
  )
  t.deepEqual(
    cachedHealth,
    { healthy: true, error: null, cached: true },
    'where second value within ttl'
  )
  t.false(healthy, 'where last value is past ttl')
  t.false(cached, 'where last value is not cached')
})

test('checks health and does not cache early', async t => {
  const healthCheck = createHealthCheck(async x => {
    await sleeP(200)
    return x
  }, { ttl: 10 })

  const p1 = healthCheck(true)
  await sleeP(100)
  const p2 = healthCheck(true)
  await sleeP(300)
  const p3 = healthCheck(false)

  const [h1, h2, h3] = await Promise.all([p1, p2, p3])

  t.deepEqual(
    h1,
    { healthy: true, error: null, cached: false },
    'where first value is not cached'
  )
  t.deepEqual(
    h2,
    { healthy: true, error: null, cached: false },
    'where second value is not cached'
  )
  t.deepEqual(
    h3,
    { healthy: true, error: null, cached: true },
    'where last value is cached'
  )
})

test('checks health and caches by ttl on error', async t => {
  const error = new Error('Fail')
  const healthCheck = createHealthCheck(x => {
    if (x === false) throw error
    return x
  }, { ttl: 1 })

  const health = await healthCheck(false)
  for (let i = 0; i < 5; i++) await healthCheck(true)
  const cachedHealth = await healthCheck(true)

  await sleeP(1100)
  const { healthy, cached } = await healthCheck(true)

  t.deepEqual(
    health,
    { healthy: false, error, cached: false },
    'where first value is not cached'
  )
  t.deepEqual(
    cachedHealth,
    { healthy: false, error, cached: true },
    'where second value within ttl'
  )
  t.true(healthy, 'where last value is past ttl')
  t.false(cached, 'where last value is not cached')
})

test('checks health with null cache', async t => {
  const healthCheck = createHealthCheck(x => x, { cache: null })
  const health = await healthCheck(true)
  const { healthy, cached } = await healthCheck(true)
  t.deepEqual(
    health,
    { healthy: true, error: null, cached: false },
    'where first value is not cached'
  )
  t.true(healthy, 'where second value is not from cache')
  t.false(cached, 'where second value is not cached')
})

/* wrap */

test('wraps boolean', async t => {
  const isTrue = await wrap(true)()
  const isFalse = await wrap(true)()
  t.true(isTrue, 'when true')
  t.true(isFalse, 'when false')
})

test('wraps sync function', async t => {
  const add = (x, y) => x + y
  const result = await wrap(add)(7, 20)
  t.is(result, 27)
})

test('wraps async function', async t => {
  const add = async (x, y) => x + y
  const result = await wrap(add)(7, 20)
  t.is(result, 27)
})

test('wraps sync wrapped function', async t => {
  const add = (x, y) => x + y
  const wrappedAdd = wrap(add)
  const result = await wrap(wrappedAdd)(3, 9)
  t.is(result, 12)
})

test('wraps async wrapped function', async t => {
  const add = async (x, y) => x + y
  const wrappedAdd = wrap(add)
  const result = await wrap(wrappedAdd)(5, 2)
  t.is(result, 7)
})

test('wraps object with sync health method', async t => {
  const health = { health: (a, b) => a + b }
  const result = await wrap(health)('x', 'y')
  t.is(result, 'xy')
})

test('wraps object with async health method', async t => {
  const health = { health: async (a, b) => a + b }
  const result = await wrap(health)('x', 'y')
  t.is(result, 'xy')
})

test('does not wrap objects without health', async t => {
  const err = { message: /object missing health/i }
  const foo = { notHealth: () => 'x' }
  t.throws(() => wrap(foo), err)
})

test('does not wrap unsupported types', async t => {
  const err = { message: /cannot create health/i }
  t.throws(() => wrap(), err, 'when undefined')
  t.throws(() => wrap(null), err, 'when null')
  t.throws(() => wrap(2), err, 'when number')
  t.throws(() => wrap('foo'), err, 'when string')
})

/* createSyncCheck */

test('checks health synchronously when healthy', t => {
  const healthCheck = createSyncCheck(x => x)
  return healthCheck(true).then(health => {
    t.deepEqual(health, { healthy: true, cached: false, error: null })
  })
})

test('checks health synchronously when unhealthy', t => {
  const healthCheck = createSyncCheck(x => x)
  const error = new Error(defaultError)
  return healthCheck(false).then(health => {
    t.deepEqual(health, { healthy: false, cached: false, error })
  })
})

test('checks health synchronously when unhealthy on error', t => {
  const error = new Error('On fire!')
  const healthCheck = createSyncCheck(x => { throw error })
  return healthCheck().then(health => {
    t.deepEqual(health, { healthy: false, cached: false, error })
  })
})
