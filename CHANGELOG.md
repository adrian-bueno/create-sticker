# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [1.2.1]

### Fixed
- The README CDN snippets pointed at a non-existent `/dist/bundle.iife.js` path or contained a `{{ version }}` placeholder.
- The README and JSDoc now document the actual default `padding` (`Math.ceil(strokeWidth / 2)`), not `1`.

### Changed (repository only, no effect on the published package)
- The root `package.json` is `private` and the `publish` script is renamed to `release`. Before, running `npm publish` in the repo root would publish the wrong package.
- Visual snapshot tests (Vitest browser mode) and a CI workflow for pushes and PRs.
- The publish workflow uses `npm ci`, checks that the tag matches the `package.json` version and runs tests before publishing.
- The publish workflow uses npm trusted publishing (OIDC) instead of an npm token.

## Planned for 2.0

These changes are breaking (the API or default output would change), so they are postponed to the next major version:

- Clamp `padding` to at least `strokeWidth / 2`, so the stroke is never clipped (this changes the output size for small explicit paddings).
- Ignore nearly transparent pixels by default (an `alphaThreshold` default above 0), so noise and antialiasing halos no longer get their own outline.

Earlier versions: see the [git history](https://github.com/adrian-bueno/create-sticker/commits/main).
