import test from 'ava'
import express from 'express'
import request from 'supertest'

import expressStatus from './status'

test('creates status middleware', async t => {
  const app = express()
  const status = {healthy: true, unhealthy: false, error: null}
  app.get('/', expressStatus({status: () => status}))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: status}, 'where body is json')
})

test('creates status middleware with null status', async t => {
  const app = express()
  app.get('/', expressStatus({status: () => null}))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: null}, 'where body is json')
})

test('creates status middleware with error message', async t => {
  const app = express()
  const status = {healthy: false, unhealthy: true, error: new Error('On fire.')}
  app.get('/', expressStatus({status: () => status}))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: {...status, error: 'On fire.'}}, 'where body is json')
})

test('creates status middleware with meta', async t => {
  const app = express()
  const status = {healthy: true, unhealthy: false, error: null}
  app.get('/', expressStatus({status: () => status, meta: () => ({id: 'foo'})}))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: status, id: 'foo'}, 'where body is json')
})
