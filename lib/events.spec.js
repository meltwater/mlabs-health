import test from 'ava'

import createHealthCheck from './check'
import createHealthEvents from './events'

test('emits events', async t => {
  t.plan(4)
  const healthCheck = createHealthCheck(true)
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  emitter.on(event, ({healthy, error}) => {
    t.true(healthy)
    t.is(error, null)
  })
  await emit()
  await emit()
})

test('passes arguments and emits healthy event', async t => {
  t.plan(1)
  const healthCheck = createHealthCheck(x => x)
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  emitter.on(event, ({healthy}) => { t.true(healthy) })
  await emit(true)
})

test('passes arguments and emits unhealthy event', async t => {
  t.plan(1)
  const healthCheck = createHealthCheck(x => x)
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  emitter.on(event, ({healthy}) => { t.false(healthy) })
  await emit(false)
})

test('emits unhealthy error event', async t => {
  t.plan(2)
  const healthCheck = createHealthCheck(() => { throw new Error('On fire!') })
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  emitter.on(event, ({healthy, error}) => {
    t.false(healthy)
    t.deepEqual(error, new Error('On fire!'))
  })
  await emit()
})
