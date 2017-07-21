import test from 'ava'

import createHealthCheck from './check'
import createHealthMonitor, { createStatus } from './monitor'
import { allHealthy } from './strategies'

/* default */

test('creates monitor with health status', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({foo: x => x, bar: x => x}, {cache: null})

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await foo(true)
  await foo(true)
  await foo(false)
  await foo(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
  t.true(status.availability > 0.6, 'where availability is high')
  t.deepEqual(status, {
    healthy: true,
    unhealthy: false,
    error: null,
    attempts: 5,
    successes: 4,
    failures: 1,
    date: status.date,
    duration: status.duration,
    uptime: status.uptime,
    downtime: status.downtime,
    availability: status.availability
  }, 'where status is set')

  t.deepEqual(
    monitor.health.meta(),
    {id: 'health'},
    'where meta is set for health'
  )

  t.deepEqual(
    monitor.foo.meta(),
    {id: 'foo'},
    'where meta is set for foo'
  )
})

test('creates monitor with custom health check wrapper', async t => {
  const now = new Date()
  const monitor = createHealthMonitor(
    {foo: x => x, bar: x => x},
    {createHealthCheck: check => createHealthCheck(x => !check(x), {cache: null})}
  )

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(false)
  await bar(false)
  await foo(true)
  await foo(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
  t.true(status.availability < 0.9, 'where availability is low')
  t.deepEqual(status, {
    healthy: false,
    unhealthy: true,
    attempts: 3,
    successes: 1,
    failures: 2,
    error: status.error,
    date: status.date,
    duration: status.duration,
    uptime: status.uptime,
    downtime: status.downtime,
    availability: status.availability
  }, 'where status is set')
})

test('creates monitor with custom strategy', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({foo: x => x, bar: x => x}, {
    strategy: allHealthy({failureRatio: 1}),
    cache: null
  })

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await foo(false)
  await foo(false)
  await foo(false)
  await bar(false)
  await foo(false)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.deepEqual(status, {
    healthy: true,
    unhealthy: false,
    attempts: 6,
    successes: 6,
    failures: 0,
    error: status.error,
    date: status.date,
    duration: status.duration,
    uptime: status.uptime,
    downtime: 0,
    availability: 1
  }, 'where status is set')
})

/* createStatus */

test('creates status', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({
    foo: createHealthCheck(x => x, {cache: null}),
    bar: createHealthCheck(x => x, {cache: null})
  }, {createHealthCheck: x => x})

  const status = createStatus({foo: monitor.foo, bar: monitor.bar})

  const foo = monitor.foo.events.emit
  const bar = monitor.bar.events.emit
  await foo(true)
  await bar(true)
  await foo(true)
  await foo(true)
  await foo(false)
  await foo(true)

  t.true(status().date > now, 'where date is updated')
  t.true(status().uptime > 0, 'where uptime is positive')
  t.true(status().downtime > 0, 'where downtime is positive')
  t.true(status().availability > 0.1, 'where availability is high')
  t.deepEqual(status(), {
    healthy: true,
    unhealthy: false,
    error: null,
    attempts: 5,
    successes: 4,
    failures: 1,
    date: status().date,
    duration: status().duration,
    uptime: status().uptime,
    downtime: status().downtime,
    availability: status().availability
  }, 'where status is set')
})
