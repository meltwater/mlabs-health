import { createHealthCheck } from '../lib'

export default options => async () => {
  const healthCheck = createHealthCheck(async x => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return x
  }, {ttl: 1})
  await healthCheck(true)
  const healths = [false, true, false, true].map(healthCheck)
  await new Promise(resolve => setTimeout(resolve, 1100))
  return Promise.all([...healths, healthCheck(false)])
}
