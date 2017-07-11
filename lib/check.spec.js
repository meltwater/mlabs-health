import test from 'ava'

import createHealthCheck, { wrap } from './check'

test('wraps boolean', async t => {
  const isTrue = await wrap(true)()
  const isFalse = await wrap(true)()
  t.true(isTrue, 'when true')
  t.true(isFalse, 'when false')
})

test('wraps function', async t => {
  const syncAdd = (x, y) => x + y
  const syncResult = await wrap(syncAdd)(7, 20)
  t.is(syncResult, 27, 'when sync')

  const asyncAdd = async (x, y) => x + y
  const asyncResult = await wrap(asyncAdd)(5, 2)
  t.is(asyncResult, 7, 'when async')
})

test('wraps object', async t => {
  const syncHealth = {health: (a, b) => a + b}
  const syncResult = await wrap(syncHealth)('x', 'y')
  t.is(syncResult, 'xy', 'when sync')

  const asyncHealth = {health: async (a, b) => a + b}
  const asyncResult = await wrap(asyncHealth)('a', 'b')
  t.is(asyncResult, 'ab', 'when async')
})

test('does not wraps objects without health', async t => {
  const msg = /object missing health/i
  const foo = {notHealth: () => 'x'}
  t.throws(() => wrap(foo), msg)
})

test('does not wrap unsupported types', async t => {
  const msg = /cannot create health/i
  t.throws(() => wrap(2), msg, 'when number')
  t.throws(() => wrap('foo'), msg, 'when string')
})
