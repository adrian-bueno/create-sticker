---
name: verify
description: Run the full validation checklist for create-sticker (build, type-check, tests, package check) and report pass/fail. Use before every commit.
---

# Verify

Run each step from the repo root and stop at the first failure. Report which step failed and the relevant output.

1. **Type-check:** `npx tsc --noEmit`
2. **Build:** `npm run build`. Then confirm that `dist/bundle.iife.js`, `dist/bundle.esm.mjs`, `dist/types/index.d.ts` and `dist/package.json` exist.
3. **Tests:** if `package.json` has a `test` script, run `npm test`.
4. **Visual changes:** if the change can affect the output image, run `npm run demo` and check the images in `demo/images/` against the screenshots in `docs/`. Or rely on the snapshot tests if they exist.

End with a one-line summary: `verify: PASS` or `verify: FAIL (<step>)`. Only commit after a PASS.
