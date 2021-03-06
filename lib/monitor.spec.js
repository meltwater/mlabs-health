import test from 'ava'
import { sleeP } from '@meltwater/phi'

import createHealthy from './healthy.js'
import createHealthCheck from './check.js'
import createHealthMonitor, { createStatus } from './monitor.js'
import { allHealthy } from './strategies/index.js'

/* default */

test('creates monitor with health status', async (t) => {
  const now = new Date()
  const monitor = createHealthMonitor(
    { foo: (x) => x, bar: createHealthCheck((x) => x, { cache: null }) },
    { cache: null, strategy: allHealthy({ healthy: ({ healthy }) => healthy }) }
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await foo(true)
  await foo(true)
  await sleeP(400)
  await foo(false)
  await sleeP(200)
  await foo(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
  t.true(status.availability > 0.6, 'where availability is high')
  t.deepEqual(
    status,
    {
      healthy: true,
      unhealthy: false,
      error: null,
      attempts: 5,
      successes: 4,
      failures: 1,
      count: 1,
      reliability: 0.8,
      date: status.date,
      duration: status.duration,
      uptime: status.uptime,
      downtime: status.downtime,
      availability: status.availability
    },
    'where status is set'
  )

  t.deepEqual(
    monitor.health.meta(),
    { id: 'health' },
    'where meta is set for health'
  )

  t.deepEqual(monitor.foo.meta(), { id: 'foo' }, 'where meta is set for foo')
})

test('creates monitor with health status and cache', async (t) => {
  const now = new Date()
  const monitor = createHealthMonitor(
    { foo: createHealthCheck((x) => x, { ttl: 200 }) },
    { strategy: allHealthy({ healthy: ({ healthy }) => healthy }) }
  )

  const foo = monitor.foo.events.emit
  await foo(true)
  await sleeP(250)
  await foo(true)
  await sleeP(250)
  await foo(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.is(status.downtime, 0, 'where downtime is zero')
  t.is(status.availability, 1, 'where availability is high')
  t.deepEqual(
    status,
    {
      healthy: true,
      unhealthy: false,
      error: null,
      attempts: 3,
      successes: 3,
      failures: 0,
      count: 3,
      reliability: 1,
      date: status.date,
      duration: status.duration,
      uptime: status.uptime,
      downtime: 0,
      availability: 1
    },
    'where status is set'
  )
})

test('creates monitor with custom health check wrapper', async (t) => {
  const now = new Date()
  const monitor = createHealthMonitor(
    { foo: (x) => x, bar: (x) => x },
    {
      createHealthCheck: (check) =>
        createHealthCheck((x) => !check(x), { cache: null }),
      strategy: allHealthy({ healthy: ({ healthy }) => healthy })
    }
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(false)
  await bar(false)
  await sleeP(200)
  await foo(true)
  await sleeP(500)
  await foo(true)
  await sleeP(200)
  await foo(true)
  await sleeP(200)
  await foo(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
  t.true(status.availability < 0.9, 'where availability is low')
  t.deepEqual(
    status,
    {
      healthy: false,
      unhealthy: true,
      attempts: 5,
      successes: 1,
      failures: 4,
      count: 4,
      reliability: 0.2,
      error: status.error,
      date: status.date,
      duration: status.duration,
      uptime: status.uptime,
      downtime: status.downtime,
      availability: status.availability
    },
    'where status is set'
  )
})

test('creates monitor with custom strategy', async (t) => {
  const now = new Date()
  const healthy = createHealthy({ minReliability: 0, minAvailability: 0 })
  const monitor = createHealthMonitor(
    { foo: (x) => x, bar: (x) => x },
    {
      strategy: allHealthy({ healthy }),
      cache: null
    }
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await sleeP(200)
  await foo(false)
  await foo(false)
  await foo(false)
  await bar(false)
  await sleeP(200)
  await foo(false)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.deepEqual(
    status,
    {
      healthy: true,
      unhealthy: false,
      attempts: 6,
      successes: 6,
      failures: 0,
      count: 6,
      reliability: 1,
      error: status.error,
      date: status.date,
      duration: status.duration,
      uptime: status.uptime,
      downtime: 0,
      availability: 1
    },
    'where status is set'
  )
})

test('creates monitor with delay', async (t) => {
  const monitor = createHealthMonitor(
    { foo: (x) => x, bar: (x) => x },
    {
      delay: 1000,
      cache: null
    }
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(false)
  await bar(false)
  await foo(false)
  await bar(false)
  await sleeP(1010)
  await foo(true)
  await bar(true)
  await foo(true)
  await bar(true)

  const status = monitor.health.status()
  t.deepEqual(
    status,
    {
      healthy: true,
      unhealthy: false,
      attempts: 3,
      successes: 3,
      failures: 0,
      count: 3,
      reliability: 1,
      error: status.error,
      date: status.date,
      duration: status.duration,
      uptime: status.uptime,
      downtime: 0,
      availability: 1
    },
    'where status is set'
  )
})

/* createStatus */

test('creates status', async (t) => {
  const now = new Date()
  const monitor = createHealthMonitor(
    { foo: (x) => x, bar: (x) => x },
    { cache: null }
  )
  const status = createStatus(
    { foo: monitor.foo, bar: monitor.bar },
    {
      strategy: allHealthy({ healthy: ({ healthy }) => true })
    }
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await sleeP(200)
  await bar(true)
  await bar(false)
  await sleeP(200)
  await bar(false)

  t.true(status().date > now, 'where date is updated')
  t.true(status().uptime > 0, 'where uptime is positive')
  t.deepEqual(
    status(),
    {
      healthy: true,
      unhealthy: false,
      error: null,
      attempts: 4,
      successes: 4,
      failures: 0,
      count: 4,
      downtime: 0,
      availability: 1,
      reliability: 1,
      date: status().date,
      duration: status().duration,
      uptime: status().uptime
    },
    'where status is set'
  )
})
