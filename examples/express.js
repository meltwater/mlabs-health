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

  app.use('/', (req, res, next) => {
    res.send(`
      <!doctype html>
      <html lang="en">
        <head><meta charset="utf-8"></head>
        <body>
          <ul>
            <li><a href='/status'>/status</a></li>
            <li><a href='/status/foo'>/status/foo</a></li>
            <li><a href='/status/bar'>/status/bar</a></li>
          </ul>
          <ul>
            <li><a href='/health'>/health</a></li>
            <li><a href='/health/foo'>/health/foo</a></li>
            <li><a href='/health/bar'>/health/bar</a></li>
          </ul>
        </body>
      </html>
    `)
  })

  const port = 3000
  const host = 'localhost'
  app.listen(port, () => {
    log.info({port, host}, `Server: http://${host}:${port}`)
  })
}
