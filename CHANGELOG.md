# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.0] / 2018-02-28

### Added

- New option `timeout`.
  - Health checks will error after the timeout in milliseconds.
  - The default value is set at one minute.
  - Health checks which never resolve cause unexpected behavior,
    so this is being released as a non-breaking change.

## 1.0.0 / 2017-11-21

- Initial release.

[Unreleased]: https://github.com/meltwater/mlabs-health/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/meltwater/mlabs-health/compare/v1.0.0...v1.1.0
