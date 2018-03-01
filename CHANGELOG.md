# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.3] / 2018-03-01

### Fixed

- Race condition where all checks would report as cached.

## [1.1.2] / 2018-02-28

### Fixed

- The timeout did not work with cache.

## [1.1.1] / 2018-02-28

### Fixed

- The `timeout` option ignored by health monitor.

## [1.1.0] / 2018-02-28

### Added

- New option `timeout`.
  - Health checks will error after the timeout in milliseconds.
  - The default value is set at one minute.
  - Health checks which never resolve cause unexpected behavior,
    so this is being released as a non-breaking change.

## 1.0.0 / 2017-11-21

- Initial release.

[Unreleased]: https://github.com/meltwater/mlabs-health/compare/v1.1.3...HEAD
[1.1.3]: https://github.com/meltwater/mlabs-health/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/meltwater/mlabs-health/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/meltwater/mlabs-health/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/meltwater/mlabs-health/compare/v1.0.0...v1.1.0
