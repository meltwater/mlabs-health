import test from 'ava'
import express from 'express'
import request from 'supertest'

import expressHealthy from './healthy'

test('creates healthy middleware with json response', async t => {
  const app = express()
  app.get('/', expressHealthy(true))
  const res = await request(app).get('/').set('Accept', 'application/json')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {healthy: true, unhealthy: false}, 'where body is json')
})

test('creates healthy middleware with text response', async t => {
  const app = express()
  app.get('/', expressHealthy(true))
  const res = await request(app).get('/').set('Accept', 'text/plain')
  t.is(res.status, 200, 'where status is set')
  t.is(res.text, 'OK', 'where body is text')
})

test('creates unhealthy middleware with json response', async t => {
  const app = express()
  app.get('/', expressHealthy(false))
  const res = await request(app).get('/').set('Accept', 'application/json')
  t.is(res.status, 500, 'where status is set')
  t.deepEqual(res.body, {healthy: false, unhealthy: true}, 'where body is json')
})

test('creates unhealthy middleware with text response', async t => {
  const app = express()
  app.get('/', expressHealthy(false))
  const res = await request(app).get('/').set('Accept', 'text/plain')
  t.is(res.status, 500, 'where status is set')
  t.is(res.text, 'Internal Server Error', 'where body is text')
})
