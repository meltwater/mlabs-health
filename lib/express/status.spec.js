import test from 'ava'
import express from 'express'
import request from 'supertest'

import expressStatus from './status'

test('creates status middleware', async t => {
  const app = express()
  const status = {healthy: true, unhealthy: false}
  app.get('/', expressStatus({status: () => status}))
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: status}, 'where body is json')
})

test('creates status middleware with null status', async t => {
  const app = express()
  app.get('/', expressStatus())
  const res = await request(app).get('/')
  t.is(res.status, 200, 'where status is set')
  t.deepEqual(res.body, {data: null}, 'where body is json')
})
