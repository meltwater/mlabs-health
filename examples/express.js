import express from 'express'

import {
  createHealthy,
  createHealthMonitor,
  expressStatusRouter,
  expressHealthRouter
} from '../lib'

export default ({log}) => async (availability = 0.8) => {
  const unstable = () => Math.random() < parseFloat(availability)
  const healthMonitor = createHealthMonitor(
    {foo: unstable, bar: unstable},
    {ttl: 2}
  )

  const app = express()
  app.use('/health', expressHealthRouter({
    healthy: createHealthy(),
    healthMonitor,
    log
  }))

  app.use('/status', expressStatusRouter({
    healthMonitor,
    log
  }))

  const port = 3000
  const host = 'localhost'
  app.listen(port, () => {
    log.info({port, host}, `Server: http://${host}:${port}/health`)
    log.info({port, host}, `Server: http://${host}:${port}/status`)
  })
}
