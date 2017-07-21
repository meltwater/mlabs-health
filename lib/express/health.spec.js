import test from 'ava'
import express from 'express'
import request from 'supertest'

import createHealthy from '../healthy'
import createHealthMonitor from '../monitor'
import expressHealth from './health'

test.beforeEach(t => {
  const monitor = createHealthMonitor({a: x => x, b: x => x}, {cache: null})
  t.context.monitor = monitor
})

test('creates health middleware with initial health', async t => {
  const app = express()
  app.get('/', expressHealth({
    healthMonitor: t.context.monitor,
    healthy: createHealthy()
  }))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {healthy: true}, 'where body is json')
})

test('creates health middleware with healthy health', async t => {
  const app = express()
  app.get('/', expressHealth({
    healthMonitor: t.context.monitor,
    healthy: createHealthy()
  }))

  await t.context.monitor.a.events.emit(true)
  await t.context.monitor.b.events.emit(true)

  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {healthy: true}, 'where body is json')
})

test('creates health middleware with unhealthy health', async t => {
  const app = express()
  app.get('/', expressHealth({
    healthMonitor: t.context.monitor,
    healthy: createHealthy({minSlr: 1})
  }))

  await t.context.monitor.a.events.emit(false)
  await t.context.monitor.b.events.emit(false)
  await t.context.monitor.b.events.emit(false)

  const res = await request(app).get('/')
  t.is(res.status, 503, 'where status is set')
  t.deepEqual(res.body, {healthy: false}, 'where body is json')
})
