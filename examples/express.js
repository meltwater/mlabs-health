import http from 'http'
import promisify from 'util.promisify'

import express from 'express'
import {
  complement,
  compose,
  filter,
  identity,
  isNil,
  keys,
  map,
  prop
} from 'ramda'

import {
  createHealthy,
  createHealthMonitor,
  healthLogging,
  expressHealthy,
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

  app.use('/api/v1/health', expressHealthy({log}))
  app.use('/api/v1/status', async (req, res, next) => {
    try {
      const status = compose(s => s(), prop('status'))
      const healths = compose(
        map(createHealthy()),
        filter(complement(isNil)),
        map(status)
      )(healthMonitor)
      res.status(200).send(map(keys, {
        healthy: filter(identity)(healths),
        unhealthy: filter(complement(identity))(healths)
      }))
    } catch (err) {
      next(err)
    }
  })

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
          <ul>
            <li><a href='/api/v1/health'>/api/v1/health</a></li>
            <li><a href='/api/v1/status'>/api/v1/status</a></li>
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
