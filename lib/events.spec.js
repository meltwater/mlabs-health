import test from 'ava'

import createHealthCheck, { defaultError } from './check'
import createHealthEvents from './events'

test('emits health events', async t => {
  t.plan(6)
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  let i = 0
  emitter.on(event, ({healthy, error, cached}) => {
    i++
    t.false(cached, `not cached for check ${i}`)
    if (i === 1) {
      t.true(healthy, `healthy for check ${i}`)
      t.is(error, null, `no error for check ${i}`)
    } else {
      t.false(healthy, `unhealthy for check ${i}`)
      t.deepEqual(error, new Error(defaultError), `error for check ${i}`)
    }
  })
  await emit(true)
  await emit(false)
})

test('emits cached health events', async t => {
  t.plan(4 * 3)
  const healthCheck = createHealthCheck(x => x, {ttl: 1})
  const { event, emitter, emit } = createHealthEvents(healthCheck)
  let i = 0
  emitter.on(event, ({healthy, error, cached}) => {
    i++
    if (i === 1) {
      t.false(cached, `not cached for check ${i}`)
    } else {
      t.true(cached, `cached for check ${i}`)
    }
    t.true(healthy, `healthy for check ${i}`)
    t.is(error, null, `no error for check ${i}`)
  })
  await emit(true)
  await emit(false)
  await emit(false)
  await emit(true)
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
    t.false(healthy, 'where unhealthy')
    t.deepEqual(error, new Error('On fire!'), 'where error is passed')
  })
  await emit()
})
