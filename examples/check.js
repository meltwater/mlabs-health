import { sleeP } from '@meltwater/phi'

import { createHealthCheck } from '../lib'

export default options => async () => {
  const healthCheck = createHealthCheck(async x => {
    await sleeP(600)
    return x
  }, { ttl: 1 })
  await healthCheck(true)
  const healths = [false, true, false, true].map(healthCheck)
  await sleeP(1100)
  return Promise.all([...healths, healthCheck(false)])
}
