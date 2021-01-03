import test from 'ava'

import createHealthy from './healthy.js'

test('healthy initially', (t) => {
  const healthy = createHealthy()

  t.true(healthy({ healthy: true }), 'when healthy')

  t.true(healthy({ healthy: false }), 'when unhealthy')
})

test('healthy or unhealthy with max downtime', (t) => {
  const healthy = createHealthy({ maxDowntime: 400 })

  t.true(
    healthy({ healthy: true, duration: 401 }),
    'when healthy for long duration'
  )

  t.true(
    healthy({ healthy: true, duration: 399 }),
    'when healthy for short duration'
  )

  t.true(
    healthy({ healthy: false, duration: 0 }),
    'when unhealthy for zero duration'
  )

  t.true(
    healthy({ healthy: false, duration: 399 }),
    'when unhealthy for short duration'
  )

  t.false(
    healthy({ healthy: false, duration: 401 }),
    'when unhealthy for long duration'
  )
})

test('healthy or unhealthy with min availability', (t) => {
  const healthy = createHealthy({ minAvailability: 0.8 })

  t.true(
    healthy({ healthy: true, availability: 0.81 }),
    'when healthy and above min availability'
  )

  t.true(
    healthy({ healthy: false, availability: 0.81 }),
    'when unhealthy and above min availability'
  )

  t.false(
    healthy({ healthy: true, availability: 0.79 }),
    'when healthy and below min availability'
  )

  t.false(
    healthy({ healthy: true, availability: 0.79 }),
    'when unhealthy and below min availability'
  )
})

test('healthy or unhealthy with min reliability', (t) => {
  const healthy = createHealthy({ minReliability: 0.8 })

  t.true(
    healthy({ healthy: true, reliability: 0.81 }),
    'when healthy and above min reliability'
  )

  t.true(
    healthy({ healthy: false, reliability: 0.81 }),
    'when unhealthy and above min reliability'
  )

  t.false(
    healthy({ healthy: true, reliability: 0.79 }),
    'when healthy and below min reliability'
  )

  t.false(
    healthy({ healthy: true, reliability: 0.79 }),
    'when unhealthy and below min reliability'
  )
})
