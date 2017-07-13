import test from 'ava'

import createHealthCheck from '../check'
import allHealthy from './all'

test('healthy when all healthy', async t => {
  const strategy = allHealthy({
    a: createHealthCheck(true, {cache: null}),
    b: createHealthCheck(true, {cache: null})
  })
  const health = await strategy()
  t.true(health)
})

test('unhealthy when some unhealthy', async t => {
  const strategy = allHealthy({
    a: createHealthCheck(true, {cache: null}),
    b: createHealthCheck(() => { throw new Error('foo') }, {cache: null})
  })
  const { errors, message } = await t.throws(strategy())
  t.regex(message, /one or more health checks failing/i)
  t.deepEqual(errors, [
    {id: 'b', error: new Error('foo')}
  ])
})

test('calls checks with arguments', async t => {
  const strategy = allHealthy({
    a: createHealthCheck(x => x === 'foo', {cache: null}),
    b: createHealthCheck(x => x === 'foo', {cache: null})
  })
  const health = await strategy('foo')
  t.true(health)
})

test('uses failure ratio', async t => {
  const willFail = n => {
    let i = -1
    return () => {
      i++
      return i < 1 || i >= n
    }
  }

  const strategy = allHealthy({
    a: createHealthCheck(willFail(2), {cache: null}),
    b: createHealthCheck(willFail(7), {cache: null})
  }, {failureRatio: 0.75})

  for (let i = 0; i < 3; i++) await strategy()
  const healthy = await strategy()
  t.true(healthy)
  await t.throws(strategy())
})
