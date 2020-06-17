import test from 'ava'
import { map } from '@meltwater/phi'

import createHealthCheck from '../check'
import createHealthEvents from '../events'
import createHealthObservables from '../observables'
import allHealthy, { defaultError } from './all'

test.beforeEach((t) => {
  const check = () => createHealthCheck((x) => x, { cache: null })
  const checks = { a: check(), b: check(), c: check() }
  const events = map(createHealthEvents)(checks)
  t.context.observables = map(createHealthObservables)(events)
  t.context.emit = map(({ emit }) => emit)(events)
})

test('healthy when all healthy', async (t) => {
  t.plan(1)
  const strategy = allHealthy()(t.context.observables)
  strategy.subscribe((x) => {
    t.deepEqual(x, { healthy: true, cached: false, error: null })
  })
  await t.context.emit.a(true)
  await t.context.emit.b(true)
  await t.context.emit.c(true)
})

test('unhealthy when one unhealthy', async (t) => {
  t.plan(1)
  const error = new Error(defaultError)
  const strategy = allHealthy({
    healthy: ({ healthy }) => healthy
  })(t.context.observables)
  strategy.subscribe((x) => {
    t.deepEqual(x, { healthy: false, cached: false, error })
  })
  await t.context.emit.a(true)
  await t.context.emit.b(false)
  await t.context.emit.c(true)
})
