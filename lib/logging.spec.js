import test from 'ava'

import createHealthMonitor from './monitor'
import healthLogging from './logging'

test.beforeEach(t => {
  const monitor = createHealthMonitor({ a: x => x, b: x => x }, { cache: null })
  t.context.monitor = monitor
})

test('creates health logging and logs healthy status', async t => {
  t.plan(4)
  const log = { info: ({ health, status }) => {
    t.truthy(health)
    t.truthy(status)
  } }
  healthLogging({ healthMonitor: t.context.monitor, log })
  await t.context.monitor.a.events.emit(true)
  await t.context.monitor.a.events.emit(true)
})

test('creates health logging and logs unhealthy status', async t => {
  t.plan(4)
  const log = { warn: ({ health, status }) => {
    t.truthy(health)
    t.truthy(status)
  } }
  healthLogging({ healthMonitor: t.context.monitor, log })
  await t.context.monitor.a.events.emit(false)
  await t.context.monitor.a.events.emit(false)
})

test('does not create logging without health monitor', async t => {
  const msg = /missing 'healthMonitor'/i
  t.throws(() => healthLogging(), msg)
})
