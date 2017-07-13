import { createHealthCheck } from '../lib'

export default options => async () => {
  const healthCheck = createHealthCheck(async x => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return x
  }, {cache: null})
  const healths = [false, true, false, true].map(healthCheck)
  await new Promise(resolve => setTimeout(resolve, 1100))
  return Promise.all([...healths, healthCheck(false)])
}
