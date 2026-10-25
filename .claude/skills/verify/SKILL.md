---
name: verify
description: Run the full validation checklist for create-sticker (build, type-check, tests, package check) and report pass/fail. Use before every commit.
---

# Verify

Run each step from the repo root and stop at the first failure. Report which step failed and the relevant output.

1. **Type-check:** `npm run typecheck`
2. **Build:** `npm run build`. Then confirm that `dist/bundle.iife.js`, `dist/bundle.esm.mjs`, `dist/types/index.d.ts` and `dist/package.json` exist.
3. **Tests:** `npm test`. If a snapshot fails, the output image changed. That is a failure unless the change is an intended, opt-in output change.
4. **Visual changes:** if the change can affect the output image, run `npm run demo` and check the images in `demo/images/` against the screenshots in `docs/`. This complements the snapshot tests.

End with a one-line summary: `verify: PASS` or `verify: FAIL (<step>)`. A PASS does not mean the change can be committed. Leave it uncommitted and wait for the maintainer to review and approve it.
