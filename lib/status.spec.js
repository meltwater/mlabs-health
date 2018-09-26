import test from 'ava'

import createHealthMonitor from './monitor'
import createStatus, { groupHealthy } from './status'

/* default */

test('creates healthy status', async t => {
  const healthMonitor = createHealthMonitor(
    { foo: true, bar: false },
    { cache: null }
  )
  const status = createStatus()
  t.deepEqual(status(healthMonitor), {}, 'where initially empty')
  await healthMonitor.foo.events.emit()
  await healthMonitor.bar.events.emit()
  t.deepEqual(
    status(healthMonitor),
    { foo: true, bar: false, health: false },
    'where returns healths'
  )
})

test('creates healthy status and uses healthy function', async t => {
  const healthMonitor = createHealthMonitor(
    { foo: true, bar: false },
    { cache: null }
  )
  const status = createStatus({ healthy: ({ healthy }) => healthy !== true })
  t.deepEqual(status(healthMonitor), {}, 'where initially empty')
  await healthMonitor.foo.events.emit()
  await healthMonitor.bar.events.emit()
  t.deepEqual(
    status(healthMonitor),
    { foo: false, bar: true, health: true },
    'where returns healths'
  )
})

test('does return create status without health monitor', async t => {
  const status = createStatus()
  const msg = /missing 'healthMonitor'/i
  t.throws(() => status(), msg)
})

/* groupHealthy */

test('creates healthy status in groups', async t => {
  const healthMonitor = createHealthMonitor(
    { foo: true, bar: false },
    { cache: null }
  )
  const status = createStatus()
  t.deepEqual(
    groupHealthy(status(healthMonitor)),
    { healthy: [], unhealthy: [] },
    'where initially empty'
  )
  await healthMonitor.foo.events.emit()
  await healthMonitor.bar.events.emit()
  t.deepEqual(
    groupHealthy(status(healthMonitor)),
    { healthy: ['foo'], unhealthy: ['bar', 'health'] },
    'where returns healths'
  )
})
