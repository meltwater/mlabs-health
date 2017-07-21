import test from 'ava'
import express from 'express'
import request from 'supertest'

import expressCheck from './check'

test('creates healthy middleware with json response', async t => {
  t.plan(4)
  const checks = [
    async () => { t.true(true) },
    async () => { t.true(true) }
  ]
  const app = express()
  app.get('/', expressCheck({checks}))
  const res = await request(app).get('/').set('Accept', 'application/json')
  t.is(res.status, 202, 'where status is set')
  t.deepEqual(res.body, {accepted: true}, 'where body is json')
})

test('creates healthy middleware with text response', async t => {
  t.plan(4)
  const checks = [
    async () => { t.true(true) },
    async () => { t.true(true) }
  ]
  const app = express()
  app.get('/', expressCheck({checks}))
  const res = await request(app).get('/').set('Accept', 'text/plain')
  t.is(res.status, 202, 'where status is set')
  t.deepEqual(res.text, 'Accepted', 'where text is set')
})

test('creates healthy middleware and passes errors', async t => {
  t.plan(4)
  const checks = [
    async () => { t.true(true) },
    async () => { throw new Error('On fire!') }
  ]
  const app = express()
  app.get('/', expressCheck({checks}))
  app.use((err, req, res, next) => {
    t.deepEqual(err, new Error('On fire!'), 'on error')
  })
  const res = await request(app).get('/').set('Accept', 'text/plain')
  t.is(res.status, 202, 'where status is set')
  t.deepEqual(res.text, 'Accepted', 'where text is set')
})
