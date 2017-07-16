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

test('passes args and emits event', async t => {
  t.plan(1)
  const healthCheck = createHealthCheck(x => x)
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  emitter.on(event, ({healthy}) => { t.false(healthy) })
  await emit(false)
})
