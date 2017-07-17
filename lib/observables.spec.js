import test from 'ava'

import createHealthCheck from './check'
import createHealthEvents from './events'
import createHealthObservables, {
  createSource,
  createValue,
  observables,
  health,
  healthy,
  error,
  attempts,
  successes,
  failures,
  date,
  status
} from './observables'

test.beforeEach(t => {
  const healthCheck = createHealthCheck((x = true) => x, {cache: null})
  const events = createHealthEvents(healthCheck)
  t.context.emit = events.emit
  t.context.source = createSource(events)
})

/* default */

test('creates observables', async t => {
  const keys = [...Object.keys(observables), 'health', 'status']
  const healthCheck = createHealthCheck(true)
  const events = createHealthEvents(healthCheck)
  const sources = createHealthObservables(events)
  const { emit } = events
  keys.forEach(k => sources[k].subscribe(x => { t.true(x !== undefined) }))
  await emit(true)
  await emit(false)
})

test('creates observables which filter cached checks', async t => {
  const healthCheck = createHealthCheck(x => x)
  const events = createHealthEvents(healthCheck)
  const { health, healthy, attempts } = createHealthObservables(events)
  const { emit } = events
  const healthValue = createValue(health, [])
  const healthyValue = createValue(healthy, false)
  const attemptsValue = createValue(attempts, 0)
  await emit(true)
  await emit(false)
  await emit(true)
  await emit(false)
  t.is(healthyValue(), true)
  t.is(attemptsValue(), 1)
  t.deepEqual(healthValue(), {healthy: true, error: null, cached: false})
})

/* createSource */

test('creates source from events', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const events = createHealthEvents(healthCheck)
  const source = createSource(events)
  source.subscribe(({healthy, error, cached}) => {
    t.false(healthy)
    t.false(cached)
    t.truthy(error)
  })
  const { emit } = events
  await emit(false)
})

/* createValue */

test('creates value', async t => {
  const source = healthy(t.context.source)
  const value = createValue(source, false)
  t.false(value())
  await t.context.emit(true)
  t.true(value())
  await t.context.emit(false)
  t.false(value())
})

/* health */

test('creates health observable', async t => {
  const source = health(t.context.source)
  source.subscribe(({healthy, error, cached}) => {
    t.true(healthy)
    t.false(cached)
    t.is(error, null)
  })
  await t.context.emit(true)
})

/* healthy */

test('creates healthy observable', async t => {
  const source = healthy(t.context.source)
  source.subscribe(x => { t.true(x) })
  await t.context.emit(true)
})

test('creates unhealthy observable', async t => {
  const source = healthy(t.context.source)
  source.subscribe(x => { t.false(x) })
  await t.context.emit(false)
})

/* error */

test('creates healthy error observable', async t => {
  const source = error(t.context.source)
  source.subscribe(x => { t.is(x, null) })
  await t.context.emit(true)
})

test('creates unhealthy error observable', async t => {
  const healthCheck = createHealthCheck(x => { throw new Error('On fire!') })
  const events = createHealthEvents(healthCheck)
  const source = error(createSource(events))
  source.subscribe(x => { t.deepEqual(x, new Error('On fire!')) })
  const { emit } = events
  await emit(false)
})

/* attempts */

test('creates attempts observable', async t => {
  const source = attempts(t.context.source)
  const value = createValue(source, 0)
  t.is(value(), 0)
  await t.context.emit()
  await t.context.emit()
  t.is(value(), 2)
  await t.context.emit()
  await t.context.emit()
  t.is(value(), 4)
})

/* successes */

test('creates successes observable', async t => {
  const source = successes(t.context.source)
  const value = createValue(source, 0)
  t.is(value(), 0)
  await t.context.emit(true)
  t.is(value(), 1)
  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 1)
  await t.context.emit(true)
  t.is(value(), 2)
})

/* date */

test('creates date observable', async t => {
  const now = new Date()
  const source = date(t.context.source)
  const value = createValue(source, now)
  t.is(value(), now)
  await t.context.emit(true)
  const next = value()
  t.true(next > now)
  await t.context.emit(false)
  t.true(value() > next)
})

/* failures */

test('creates failures observable', async t => {
  const source = failures(t.context.source)
  const value = createValue(source, 0)
  t.is(value(), 0)
  await t.context.emit(true)
  t.is(value(), 0)
  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 2)
  await t.context.emit(true)
  t.is(value(), 2)
})

/* status */

test('creates status observable', async t => {
  const source = status(t.context.source, {
    a: healthy(t.context.source),
    b: healthy(t.context.source)
  })
  source.subscribe(x => { t.deepEqual(x, {a: true, b: true}) })
  await t.context.emit(true)
})
