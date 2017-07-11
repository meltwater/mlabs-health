import { createHealthCheck } from '../lib'

export default options => async () => {
  const healthCheck = createHealthCheck(false)
  await healthCheck()
  await healthCheck()
  await healthCheck()
  const health = await healthCheck()
  const error = health.error
  return {
    ...health,
    error: error ? error.toString() : null,
    errors: health.errors.map(e => e.toString())
  }
}
