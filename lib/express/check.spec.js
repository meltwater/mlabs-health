import test from 'ava'
import express from 'express'
import request from 'supertest'
import { compose, map, prop, propOr } from 'ramda'

import createHealthMonitor from '../monitor'
import expressCheck from './check'

test.beforeEach(t => {
  const monitor = createHealthMonitor({a: true, b: true}, {cache: null})
  t.context.monitor = monitor
  t.context.checks = map(
    compose(prop('emit'), propOr(() => {}, 'events'))
  )(monitor)
})

test('creates healthy middleware with json response', async t => {
  t.plan(3)
  const app = express()
  app.get('/', expressCheck(t.context.checks))
  app.use((req, res, next, err) => { if (err) t.fail('on error') })

  const res = await request(app).get('/').set('Accept', 'application/json')
  t.is(res.status, 202, 'where status is set')
  t.deepEqual(res.body, {accepted: true}, 'where body is json')

  t.context.monitor.a.observables.healthy.subscribe(x => {
    t.true(x, 'where a is healthy')
  })

  t.context.monitor.b.observables.healthy.subscribe(x => {
    t.true(x, 'where b is healthy')
  })

  t.context.monitor.health.observables.healthy.subscribe(x => {
    t.true(x, 'where health is healthy')
  })
})
