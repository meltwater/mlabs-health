import test from 'ava'

import createHealthCheck from './check'
import createHealthMonitor from './monitor'
import { allHealthy } from './strategies'

test('creates monitor with health status', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({
    a: createHealthCheck(x => x, {cache: null}),
    b: createHealthCheck(x => x, {cache: null})
  }, {
    createHealthCheck: x => x
  })

  const a = monitor.a.events.emit
  const b = monitor.b.events.emit
  await a(true)
  await b(true)
  await a(true)
  await a(true)
  await a(false)
  await a(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
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
    downtime: status.downtime
  })
})

test('creates monitor with custom health check wrapper', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({a: x => x, b: x => x}, {
    createHealthCheck: check => createHealthCheck(x => !check(x), {cache: null})
  })

  const a = monitor.a.events.emit
  const b = monitor.b.events.emit
  await a(false)
  await b(false)
  await a(true)
  await a(true)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.true(status.downtime > 0, 'where downtime is positive')
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
    downtime: status.downtime
  })
})

test('creates monitor with custom strategy', async t => {
  const now = new Date()
  const monitor = createHealthMonitor({
    a: createHealthCheck(x => x, {cache: null}),
    b: createHealthCheck(x => x, {cache: null})
  }, {
    strategy: allHealthy({failureRatio: 1}),
    createHealthCheck: x => x
  })

  const a = monitor.a.events.emit
  const b = monitor.b.events.emit
  await a(true)
  await b(true)
  await a(false)
  await a(false)
  await a(false)
  await b(false)
  await a(false)

  const status = monitor.health.status()
  t.true(status.date > now, 'where date is updated')
  t.true(status.uptime > 0, 'where uptime is positive')
  t.is(status.downtime, 0, 'where no downtime')
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
    downtime: status.downtime
  }, 'where status is set')
})
