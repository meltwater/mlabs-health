import test from 'ava'
import express from 'express'
import request from 'supertest'

import createHealthMonitor from '../monitor'
import statusRouter from './status-router'

test('creates status router', async t => {
  const healthMonitor = createHealthMonitor(
    {foo: x => x, bar: x => x},
    {cache: null}
  )

  const app = express()
  app.use(statusRouter({healthMonitor}))
  const initialRes = await request(app).get('/')

  t.is(initialRes.status, 200, 'where initial health status is set')
  t.deepEqual(initialRes.body, {
    id: 'health',
    ids: ['bar', 'foo', 'health'],
    data: null,
    degraded: false,
    healthy: [],
    unhealthy: []
  }, 'where initial health body is set')

  await healthMonitor.foo.events.emit(true)
  await healthMonitor.bar.events.emit(false)

  const res = await request(app).get('/')
  t.is(res.status, 200, 'where health status is set')
  t.deepEqual(res.body, {
    id: 'health',
    ids: ['bar', 'foo', 'health'],
    data: {
      ...healthMonitor.health.status(),
      error: healthMonitor.health.status().error.message,
      date: healthMonitor.health.status().date.toString()
    },
    degraded: true,
    healthy: ['foo'],
    unhealthy: ['bar']
  }, 'where health body is set')
})

test('creates status router with substatus', async t => {
  const healthMonitor = createHealthMonitor(
    {foo: x => x, bar: x => x},
    {cache: null}
  )

  const app = express()
  app.use(statusRouter({healthMonitor}))
  const initialRes = await request(app).get('/foo')

  t.is(initialRes.status, 200, 'where initial health status is set')
  t.deepEqual(initialRes.body, {
    id: 'foo',
    data: null
  }, 'where initial health body is set')

  await healthMonitor.foo.events.emit(false)

  const res = await request(app).get('/foo')
  t.is(res.status, 200, 'where health status is set')
  t.deepEqual(res.body, {
    id: 'foo',
    data: {
      ...healthMonitor.foo.status(),
      error: healthMonitor.foo.status().error.message,
      date: healthMonitor.foo.status().date.toString()
    }
  }, 'where initial health body is set')
})

test('does not create status router without health monitor', async t => {
  const msg = /missing 'healthMonitor'/i
  t.throws(() => statusRouter(), msg)
})
