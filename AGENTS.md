# AGENTS.md

Guidance for AI coding agents working on this repository.

## Project

`@devadri/create-sticker` is a small TypeScript library that adds a sticker effect (outline stroke, optional hole filling) to images with transparent backgrounds.

- Browser-only: it relies on `HTMLCanvasElement`, `Image` and `CanvasRenderingContext2D`.
- Zero runtime dependencies. Keep it that way.
- Published from `dist/` (the build copies a trimmed `package.json`, `README.md` and `LICENSE.md` there), so `dist/` is the package root on npm/unpkg.

## Pipeline

`createSticker(src, options)` in `src/create-sticker.ts`:

1. `loadImage` (`src/load-image.ts`): loads the image into a canvas with transparent padding and merges the options with the defaults.
2. `splitIntoDiscreteElements`: repeatedly finds a group of non-transparent pixels, then traces its outline with marching squares (`src/d3-geometry-contour.ts`, ported from d3-contour). It copies the group to its own canvas and erases it from the main canvas, until `imageCanvasIsEmpty` returns true.
3. `addStickerEffectToDiscreteElements` (`src/add-sticker-effect.ts`): strokes (and optionally fills) each element's contour path.
4. Joins the element canvases, draws the original image on top and returns a PNG data URL.

Other files:
- `src/define-geometry-path.ts`: builds a canvas path from contour points.
- `src/models/`: public and internal types. Only `CreateStickerOptions` and `createSticker` are exported from `src/index.ts`.

## Commands

```sh
npm install
npm run build      # tsc (declarations only) + esbuild IIFE and ESM bundles into dist/
npx tsc --noEmit   # type-check
npm run demo       # serves demo/index.html on http://localhost:3000 (run build first)
```

## Conventions

- TypeScript strict mode. 2-space indent and UTF-8 per `.editorconfig`.
- Match the surrounding code style: small single-purpose modules and plain functions.
- Conventional commit messages: `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `ci:`, `chore:`, with an optional scope (for example `chore(demo):`).

## Rules

- **Keep 1.x non-breaking.** No changes to existing function signatures or return types, and no changes to the default output (image size or pixels). New behavior must be opt-in through options whose defaults keep the current result. Record breaking ideas under "Planned for 2.0" in the CHANGELOG instead of implementing them.
- **One change per commit.** Do not mix unrelated changes.
- **Validate before committing.** Build, type-check and test (once tests exist). For visual changes, also check the demo. Never commit a broken state.
- **Never push, tag or publish.** No `git push`, no `git tag`, no `npm publish`. Pushing a `v*.*.*` tag triggers `.github/workflows/publish-release.yml`, which publishes to npm. Releases are done by the maintainer.

## Release flow (maintainer)

1. Bump `version` in `package.json` (`chore: bump version to X.Y.Z`).
2. Tag `vX.Y.Z` and push the tag.
3. CI builds and publishes `dist/` to npm with provenance.
