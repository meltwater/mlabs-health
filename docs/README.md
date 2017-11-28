# API Reference

## Top-Level Exports

- [`createHealthMonitor(targets, options)`](#createhealthmonitortargets-options)
- [`createHealthCheck(target)`](#createhealthchecktarget)
- [`createHealthy(options)`](#createhealthyoptions)
- [`healthLogging(options)`](#healthloggingoptions)

### Importing

Every function described above is a top-level export.
You can import any of them like this:

```js
import { createHealthMonitor } from '@meltwater/mlabs-health'
```

---
### `createHealthMonitor(targets, options)`

Creates a new health monitor.

#### Arguments

1. `targets` (*object*): Health checks to use.
2. `options` (*object*):
    - `delay` (*number*): Milliseconds before `health` emits first event.
      Default: 0.
    - `ttl` (*number*): Seconds to cache health check result.
      Default: 1 minute.
    - `cache` (*object*|*null*): Default [cache instance][node-cache-manager].
      Default: an in memory cache with the above `ttl`.
    - `strategy`: Health strategy for `health`.
      Default: the all-healthy strategy.
    - `createHealthCheck`: Function to wrap all targets with.
      Default: the `createHealthCheck` function provided in this module.

#### Returns

(*object*): The health monitor.

---
### `createHealthCheck(target)`

Creates a health check for use by a health monitor.

1. `target` (*any*): Thing to convert to health check.
2. `options` (*object*):
    - `ttl` (*number*): Seconds to cache health check result.
      Default: 1 minute.
    - `cache` (*object*|*null*): Default [cache instance][node-cache-manager].
      Default: an in memory cache with the above `ttl`.

#### Returns

(*function*): An asynchronous health check function.

---
### `createHealthy(options)`

Creates a function which maps health status objects to a boolean healthy status.

#### Arguments

1. `options` (*object*):
    - `minAvailability` (*number*): Minimum availability before unhealthy.
      Default: 0.9.
    - `minReliability` (*number*): Minimum reliability before unhealthy.
      Default: 0.9.
    - `maxDowntime` (*number*): Maximum downtime (in milliseconds) before unhealthy.
      Default: 5 minutes.

#### Returns

(*function*): Function that maps status to boolean.

---
### `healthLogging(options)`

Logs all events in the status stream
for all health checks in the health monitor.

#### Arguments

1. `options` (*object*):
    - `healthMonitor` (*object*): The health monitor to use.
    - `log` (*object*): A [Bunyan] compatible logger.
      Default: a new logger.

#### Returns

(*undefined*)

[Bunyan]: https://github.com/trentm/node-bunyan
[node-cache-manager]: https://github.com/BryanDonovan/node-cache-manager
