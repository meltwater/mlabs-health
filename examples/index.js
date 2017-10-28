import 'source-map-support/register'

import path from 'path'

import createExamples from '@meltwater/examplr'

import check from './check'
import events from './events'
import express from './express'
import monitor from './monitor'
import observables from './observables'

const examples = {
  check,
  events,
  monitor,
  express,
  observables
}

const envVars = [
  'LOG_LEVEL'
]

const defaultOptions = {}

if (require.main === module) {
  const { runExample } = createExamples({
    examples,
    envVars,
    defaultOptions
  })

  runExample({
    local: path.resolve(__dirname, 'local.json')
  })
}
