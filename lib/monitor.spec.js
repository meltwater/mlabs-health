import test from 'ava'

import createHealthCheck from './check'
import createHealthMonitor from './monitor'

test('returns health stats for all checks', async t => {
  const monitor = createHealthMonitor({
    a: createHealthCheck(x => x, {cache: null}),
    b: createHealthCheck(x => x, {cache: null})
  }, {
    createHealthCheck: x => x
  })

  await monitor.a.emit(true)
  await monitor.b.emit(true)
  await monitor.a.emit(true)
  await monitor.a.emit(true)
  await monitor.a.emit(false)
  await monitor.a.emit(true)
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
