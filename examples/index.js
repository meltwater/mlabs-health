import path from 'path'

import { createExamples } from '@meltwater/examplr'

import check from './check.js'
import events from './events.js'
import monitor from './monitor.js'
import observables from './observables.js'

const examples = {
  check,
  events,
  monitor,
  observables
}

// prettier-ignore
const envVars = [
  'LOG_LEVEL',
  'LOG_FILTER',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {}

const { runExample } = createExamples({
  examples,
  envVars,
  defaultOptions
})

runExample({
  local: path.resolve(__dirname, 'local.json')
})
