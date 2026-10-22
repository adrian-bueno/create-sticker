# AGENTS.md

Guidance for AI coding agents working on this repository.

## Project

`@devadri/create-sticker` is a small TypeScript library that adds a sticker effect (outline stroke, optional hole filling) to images with transparent backgrounds.

- Browser-only: it relies on `HTMLCanvasElement`, `Image` and `CanvasRenderingContext2D`.
- Zero runtime dependencies. Keep it that way.
- Published from `dist/` (the build copies a trimmed `package.json`, `README.md` and `LICENSE.md` there), so `dist/` is the package root on npm/unpkg.
- Entry points: `exports` selects `bundle.esm.mjs` (import) or `bundle.cjs.js` (require). `unpkg`/`jsdelivr` point at `bundle.iife.js` (global `CreateSticker`). The `./*` export keeps every file path importable. Do not remove it in 1.x.

## Pipeline

`createStickerCanvas(image, options)` in `src/create-sticker.ts`:

1. `loadImage` (`src/load-image.ts`): resolves the input (URL, Blob, image, canvas or bitmap) and draws it into a canvas with transparent padding and merges the options with the defaults.
2. `findDiscreteElements` finds each group of non-transparent pixels ("discrete element") and traces its outline with marching squares (`src/d3-geometry-contour.ts`, ported from d3-contour). It erases each element from the image canvas before looking for the next one. The pixel data is read once, the start-point scan resumes where it stopped, and only each element's bounding box is read again.
3. Draw the extra `outlines` (outermost first, for all elements). Then, for each element, on a single output canvas: draw the element's pixels (from the source image, clipped to the outline), then `addStickerLayer` (`src/add-sticker-effect.ts`) strokes and optionally fills the outline, then draw the element's pixels again.
4. Draw the original image on top. `createStickerCanvas` returns this canvas; `createSticker` and `createStickerBlob` encode it.

Other files:
- `src/define-geometry-path.ts`: builds a canvas path from contour points.
- `src/models/`: public and internal types. `src/index.ts` exports the public API: `createSticker`, `createStickerBlob`, `createStickerCanvas` and the `CreateStickerOptions` and `StickerImageSource` types. Everything else is internal.

## Commands

```sh
npm install
npm run build      # tsc (declarations only) + esbuild IIFE, ESM and CJS bundles into dist/
npm run typecheck  # type-check src/ and test/
npm test           # Vitest browser mode (Playwright Chromium)
npm run test:update  # rewrite snapshots after an intended output change
npm run demo       # serves demo/index.html on http://localhost:3000 (run build first)
```

The first test run needs a browser: `npx playwright install chromium`.

## Tests

- `test/create-sticker.test.ts` runs `createSticker` on every image in `demo/images/` with several option sets.
- Each result is snapshotted as width, height and a SHA-256 hash of the decoded RGBA pixels (`test/__snapshots__/`). A snapshot change means the output image changed.
- In 1.x, existing snapshots must not change: refactors and new opt-in options must keep them identical. Only update them (`npm run test:update`) for an intended, non-default output change, and give the reason in the commit message.

## Conventions

- TypeScript strict mode. 2-space indent and UTF-8 per `.editorconfig`.
- Match the surrounding code style: small single-purpose modules and plain functions.
- Conventional commit messages: `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `ci:`, `chore:`, with an optional scope (for example `chore(demo):`).

## Rules

- **Keep 1.x non-breaking.** No changes to existing function signatures or return types, and no changes to the default output (image size or pixels). New behavior must be opt-in through options whose defaults keep the current result. Record breaking ideas under "Planned for 2.0" in the CHANGELOG instead of implementing them.
- **One change per commit.** Do not mix unrelated changes.
- **Validate before committing.** Type-check, test and build. For visual changes, also check the demo. Never commit a broken state.
- **Never push, tag or publish.** No `git push`, no `git tag`, no `npm publish`. Pushing a `v*.*.*` tag triggers `.github/workflows/publish-release.yml`, which publishes to npm. Releases are done by the maintainer.

## Release flow (maintainer)

1. Bump `version` in `package.json` (`chore: bump version to X.Y.Z`).
2. Tag `vX.Y.Z` and push the tag.
3. CI builds and publishes `dist/` to npm with provenance.
