import test from 'ava'
import express from 'express'
import request from 'supertest'

import createHealthMonitor from '../monitor'
import healthRouter from './health-router'

const willFail = n => {
  let i = 0
  return () => {
    i++
    return i < n
  }
}

test('creates health router', async t => {
  const healthMonitor = createHealthMonitor(
    {foo: willFail(2), bar: willFail(2)},
    {cache: null}
  )

  const app = express()
  app.use(healthRouter({healthMonitor}))

  const initialRes = await request(app).get('/')
  t.is(initialRes.status, 200, 'where initial health status is set')
  t.deepEqual(
    initialRes.body,
    {id: 'health', healthy: true},
    'where initial health body is set'
  )

  const res = await request(app).get('/')
  t.is(res.status, 200, 'where health status is set')
  t.deepEqual(
    res.body,
    {id: 'health', healthy: true},
    'where health body is set'
  )

  const lastRes = await request(app).get('/')
  t.is(lastRes.status, 503, 'where last health status is set')
  t.deepEqual(
    lastRes.body,
    {id: 'health', healthy: false},
    'where last health body is set'
  )
})

test('creates health router with subhealth', async t => {
  const healthMonitor = createHealthMonitor(
    {foo: willFail(2), bar: willFail(2)},
    {cache: null}
  )

  const app = express()
  app.use(healthRouter({healthMonitor}))

  const initialRes = await request(app).get('/foo')
  t.is(initialRes.status, 200, 'where initial health status is set')
  t.deepEqual(
    initialRes.body,
    {id: 'foo', healthy: true},
    'where initial health body is set'
  )

  const res = await request(app).get('/foo')
  t.is(res.status, 200, 'where health status is set')
  t.deepEqual(
    res.body,
    {id: 'foo', healthy: true},
    'where health body is set'
  )

  const lastRes = await request(app).get('/foo')
  t.is(lastRes.status, 503, 'where last health status is set')
  t.deepEqual(
    lastRes.body,
    {id: 'foo', healthy: false},
    'where last health body is set'
  )
})

test('does not create status router without health monitor', async t => {
  const msg = /missing 'healthMonitor'/i
  t.throws(() => healthRouter(), msg)
})
