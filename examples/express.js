import http from 'http'
import promisify from 'util.promisify'

import express from 'express'

import {
  createHealthy,
  createHealthMonitor,
  healthLogging,
  expressStatusRouter,
  expressHealthRouter
} from '../lib'

export default ({log}) => async (availability = 0.8) => {
  const unstable = () => Math.random() < parseFloat(availability)
  const healthMonitor = createHealthMonitor(
    {foo: unstable, bar: unstable},
    {ttl: 2}
  )

  healthLogging({healthMonitor, log})

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

  app.get('/', (req, res, next) => {
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
  const listen = promisify((...args) => app.listen(...args))
  await listen(port)
  log.info({port, host}, `Server: http://${host}:${port}`)

  http.get[promisify.custom] = options => new Promise((resolve, reject) => {
    http.get(options, response => {
      response.end = new Promise(resolve => response.on('end', resolve))
      resolve(response)
    }).on('error', reject)
  })

  const get = promisify(http.get)

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
      await get(`http://${host}:${port}/health`)
    } catch (err) {
      log.warn({err}, 'Health: Fail')
    }
  }
}
