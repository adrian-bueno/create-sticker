# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## Planned for 2.0

These changes are breaking (the API or default output would change), so they are postponed to the next major version:

- Clamp `padding` to at least `strokeWidth / 2`, so the stroke is never clipped (this changes the output size for small explicit paddings).
- Ignore nearly transparent pixels by default (an `alphaThreshold` default above 0), so noise and antialiasing halos no longer get their own outline.

## [Unreleased]

### Added
- `createSticker` also accepts a `Blob`/`File`, `HTMLImageElement`, `HTMLCanvasElement`, `OffscreenCanvas` or `ImageBitmap`, not only a URL string. The new `StickerImageSource` type is exported.
- `alphaThreshold` option: ignore nearly transparent pixels when finding outlines. The default `0` keeps the current behavior.
- `crossOrigin` option (default `"anonymous"`): remote images are requested with CORS, so images from servers that allow CORS now work instead of failing with a tainted canvas `SecurityError`. If the pixels still cannot be read, the error explains why.

### Fixed
- `require("@devadri/create-sticker")` returned an empty object, because `main` pointed at the IIFE bundle. There is now a CommonJS bundle (`bundle.cjs.js`), and an `exports` map selects the ESM or CJS build. All existing file paths stay importable, and bare unpkg/jsdelivr URLs still serve the IIFE bundle.

### Changed
- Faster sticker generation (one pixel read, a single output canvas). The output is pixel-identical: about 2.5x faster on large images and over 10x faster on images with many separate shapes.
- The package declares `"sideEffects": false` for better tree shaking.

## [1.2.1]

### Fixed
- The README CDN snippets pointed at a non-existent `/dist/bundle.iife.js` path or contained a `{{ version }}` placeholder.
- The README and JSDoc now document the actual default `padding` (`Math.ceil(strokeWidth / 2)`), not `1`.

### Changed (repository only, no effect on the published package)
- The root `package.json` is `private` and the `publish` script is renamed to `release`. Before, running `npm publish` in the repo root would publish the wrong package.
- Visual snapshot tests (Vitest browser mode) and a CI workflow for pushes and PRs.
- The publish workflow uses `npm ci`, checks that the tag matches the `package.json` version and runs tests before publishing.
- The publish workflow uses npm trusted publishing (OIDC) instead of an npm token, and only stages releases: a maintainer approves each version with 2FA before it is published.
- Updated development dependencies (including `npm audit fix`) and the Node.js version in `.nvmrc`.

## [1.2.0]

### Fixed
- Images were shrunk by the padding size, and the sticker layers were drawn with the wrong offsets and sizes, which distorted the result.
- A race condition could read the sticker canvases before their content was drawn.
- The `strokeWidth` JSDoc said the default was `10`. The actual default is `20`.
- The `license` field in `package.json` is now the valid SPDX identifier `Unlicense`.

### Changed
- When `padding` is not set, it now defaults to half the stroke width (minimum `1`) instead of `1`, so the stroke is not clipped at the image edges. Output images are larger when `padding` is not set.

## [1.1.0]

### Added
- `fillHoles` option (default `true`): fill transparent holes inside an object with the stroke color.

## [1.0.1]

### Fixed
- The README unpkg URL pointed at a non-existent `/dist/` path.

### Changed
- Added npm keywords to make the package easier to find.

## [1.0.0]

### Added
- First release. `createSticker(imageSrc, options)` adds a sticker outline around each shape of an image with a transparent background and returns a PNG data URL.
- Options: `strokeWidth` (default `20`), `strokeColor` (default `"white"`) and `padding` (default `1`).
- Browser (IIFE, global `CreateSticker`) and ESM bundles, with TypeScript types.
