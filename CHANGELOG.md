# Changelog

## [0.3.0] - 2026-04-13

### Added
- Configurable retry logic with exponential backoff and jitter
- Respect for Retry-After headers on 429 responses
- User-facing Error Handling parameters (max retries, initial delay, respect Retry-After)

## [0.2.6] - 2026-04-13

### Changed
- Updated npm keywords for better discoverability

## [0.2.5] - 2026-04-12

### Changed
- Added non-project files to gitignore and npmignore

## [0.2.0] - 2026-04-12

### Added
- Initial release with Transcribe, Get Transcription, List Transcriptions, and Get Credits operations
- Built-in polling for transcription completion
- Fire-and-forget mode with optional webhook callback
- Instagram URL normalization
