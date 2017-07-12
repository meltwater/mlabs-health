import test from 'ava'

import createHealthCheck from './check'
import createHealthStats from './stats'

test('returns health stats', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const healthStats = createHealthStats(healthCheck)

  for (let i = 0; i < 6; i++) await healthStats(true)
  for (let i = 0; i < 10; i++) await healthStats(false)
  await healthStats(true)
  const {
    healthy,
    error,
    date,
    attempts,
    successes,
    failures,
    health
  } = await healthStats(false)

  const unhealthyResult = await healthCheck(false)

  t.deepEqual({healthy, error, attempts, successes, failures}, {
    healthy: false,
    error: unhealthyResult.error,
    attempts: 18,
    failures: 11,
    successes: 7
  })

  t.true(date instanceof Date)
  t.is(health.length, 18)
  t.true(health[15].healthy)
  t.true(health[5].date instanceof Date)
  t.is(health[15].error, null)
})

test('limits health history size', async t => {
  const healthCheck = createHealthCheck(x => x, {cache: null})
  const healthStats = createHealthStats(healthCheck, {maxHistory: 3})

  for (let i = 0; i < 10; i++) await healthStats(true)
  await healthStats(false)
  await healthStats(false)
  const { healthy, attempts, successes, failures } = await healthStats(true)
  t.true(healthy)
  t.is(attempts, 3)
  t.is(successes, 1)
  t.is(failures, 2)
})

test('does not track cached results', async t => {
  const healthCheck = createHealthCheck(x => x, {ttl: 1})
  const healthStats = createHealthStats(healthCheck)

  for (let i = 0; i < 5; i++) await healthStats(true)
  const cachedStats = await healthStats(false)

  t.deepEqual({
    healthy: cachedStats.healthy,
    error: cachedStats.error,
    attempts: cachedStats.attempts,
    successes: cachedStats.successes,
    failures: cachedStats.failures
  }, {
    healthy: true,
    error: null,
    attempts: 1,
    successes: 1,
    failures: 0
  })

  await new Promise(resolve => setTimeout(resolve, 1100))

  const stats = await healthStats(false)
  const { error } = await healthCheck(false)

  t.deepEqual({
    healthy: stats.healthy,
    error: stats.error,
    attempts: stats.attempts,
    successes: stats.successes,
    failures: stats.failures
  }, {
    healthy: false,
    error,
    attempts: 2,
    successes: 1,
    failures: 1
  })
})
