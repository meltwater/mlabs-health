import test from 'ava'

import healthy from './healthy'

test('healthy initially', t => {
  const isHealthy = healthy()

  t.true(
    isHealthy({healthy: true, uptime: 0, downtime: 0, duration: 0}),
    'when healthy'
  )

  t.true(
    isHealthy({healthy: false, uptime: 0, downtime: 0, duration: 0}),
    'when unhealthy'
  )
})

test('healthy or unhealthy with longest downtime', t => {
  const isHealthy = healthy({longestDowntime: 400})

  t.true(
    isHealthy({healthy: true, uptime: 10000, downtime: 400, duration: 600}),
    'when healthy'
  )

  t.true(
    isHealthy({healthy: false, uptime: 10000, downtime: 1, duration: 0}),
    'when unhealthy for zero duration'
  )

  t.true(
    isHealthy({healthy: false, uptime: 10000, downtime: 500, duration: 399}),
    'when unhealthy for short duration'
  )

  t.false(
    isHealthy({healthy: false, uptime: 10000, downtime: 500, duration: 401}),
    'when unhealthy for long duration'
  )
})

test('healthy or unhealthy with min slr', t => {
  const isHealthy = healthy({minSlr: 0.8})

  t.true(
    isHealthy({healthy: true, uptime: 1000, downtime: 250, duration: 200}),
    'when healthy and above slr'
  )

  t.true(
    isHealthy({healthy: false, uptime: 1000, downtime: 250, duration: 200}),
    'when unhealthy and above slr'
  )

  t.false(
    isHealthy({healthy: true, uptime: 1000, downtime: 251, duration: 200}),
    'when healthy and below slr'
  )

  t.false(
    isHealthy({healthy: false, uptime: 1000, downtime: 251, duration: 200}),
    'when unhealthy and below slr'
  )
})
