import test from 'ava'

import createHealthCheck from './check'
import createHealthMonitor from './monitor'
import { allHealthy } from './strategies'

test('creates monitor with health status', async t => {
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

  t.deepEqual(monitor.health.status(), {
    healthy: true,
    unhealthy: false,
    error: null,
    attempts: 5,
    successes: 4,
    failures: 1,
    date: monitor.health.status().date
  })
})

test('creates monitor with custom health check wrapper', async t => {
  const monitor = createHealthMonitor({a: x => x, b: x => x}, {
    createHealthCheck: check => createHealthCheck(x => !check(x), {cache: null})
  })

  const a = monitor.a.events.emit
  const b = monitor.b.events.emit
  await a(false)
  await b(false)
  await a(true)
  await a(true)

  t.deepEqual(monitor.health.status(), {
    healthy: false,
    unhealthy: true,
    error: monitor.health.status().error,
    attempts: 3,
    successes: 1,
    failures: 2,
    date: monitor.health.status().date
  })
})

test('creates monitor with custom strategy', async t => {
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

  t.deepEqual(monitor.health.status(), {
    healthy: true,
    unhealthy: false,
    error: monitor.health.status().error,
    attempts: 6,
    successes: 6,
    failures: 0,
    date: monitor.health.status().date
  })
})
