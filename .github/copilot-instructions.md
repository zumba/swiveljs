# GitHub Copilot instructions

Repository: **SwivelJS** — a strategy-driven feature-toggle library distributed as a single UMD bundle. Consumed in **both server (Node) and client (browser)** environments.

Use these instructions for both inline code suggestions and pull-request code review.

## Supported consumption paths

All of these are load-bearing and tested in `test/spec/Compatibility.spec.js`:

- Node CJS via `require('swiveljs')`
- Node ESM via `import Swivel from 'swiveljs'` (resolves through Node's CJS→ESM default-import interop)
- Browser `<script src="dist/swivel.min.js">` → sets `window.Swivel`
- Browser via a bundler (webpack, rollup, vite, esbuild) → uses the CJS resolution
- AMD loaders → `define('Swivel', …)`

Browser baseline is modern (ES2015+). IE is **not** supported (`Object.assign` is the binding constraint). Native browser ESM (`<script type="module">`) loading the dist file directly is intentionally **not** a supported path — browser ESM consumers must use a bundler.

## What to flag in code review

This project has a small number of high-impact compatibility invariants. Treat any change that touches one of the items below as a review-blocker unless the PR explicitly justifies it.

### 1. UMD ↔ ESM/CJS interop

`dist/swivel.js` is a hand-rolled UMD bundle: it has no `export` statements and relies on the export-detection IIFE in `src/export.js` to set `module.exports`, the AMD `define`, or `window.Swivel`. ESM consumers work via Node's CJS→ESM default-import interop.

Flag a regression if a PR:

- Adds `"type": "module"` to `package.json`. This makes Node parse `dist/swivel.js` as ESM, which fails because the bundle has no exports. The unit tests under Vitest may still pass (its transformer is forgiving), but real Node ESM consumers will break. `test/spec/Compatibility.spec.js` exists specifically to catch this — confirm it is unchanged and still spawns a real `node` subprocess.
- Replaces the UMD wrapper in `src/export.js` with `export default Swivel` or named ESM exports without keeping a UMD-compatible build alongside.
- Removes the final `else { root.Swivel = Swivel; }` branch from `src/export.js`. That branch is the browser-`<script>` path; without it, every `<script src="dist/swivel.js">` consumer silently breaks (no `window.Swivel`).
- Changes the `main` field in `package.json` away from `dist/swivel.js`.
- Renames source files to `.mjs` (only the tooling files `scripts/build.mjs` and `eslint.config.mjs` should be `.mjs`).

### 2. Banner preservation

Both `dist/swivel.js` and `dist/swivel.min.js` must include the license banner (version, build date, copyright, license). Flag a regression if a PR:

- Removes `format.preamble: banner` from the Terser call in `scripts/build.mjs`.
- Switches the Terser invocation back to the CLI without an equivalent `--preamble` flag.
- Moves the banner *outside* the IIFE wrapper (the master layout puts it inside, after `'use strict'`).

### 3. Build pipeline integrity

The build script in `scripts/build.mjs` concatenates the source files in a fixed order (`src/globals.js`, `src/Swivel/Behavior.js`, `src/Swivel/Bucket.js`, `src/Swivel/Builder.js`, `src/Swivel/FeatureMap.js`, `src/Swivel/Swivel.js`, `src/export.js`). Order matters because the bundle relies on var-hoisting and top-down declaration.

Flag a regression if a PR:

- Reorders or globs the `srcFiles` array.
- Drops the `;(function SwivelJS(undefined) { 'use strict'; … }.call(this));` wrapper or its 4-space body indentation.
- Changes the IIFE body to top-level `let`/`const` in a way that would shadow the existing `var` declarations and change hoisting behavior.

### 4. Public API surface

The library exposes `Swivel` (constructor, callable with or without `new`) and the attached statics `Swivel.Behavior`, `Swivel.Bucket`, `Swivel.Builder`, `Swivel.FeatureMap`. Instance methods: `forFeature`, `invoke`, `returnValue`, `setBucket`. Renaming, removing, or restructuring any of these is a breaking change and must be called out in the PR description.

### 5. Source-file syntax level

Files under `src/**` ship unchanged to **browsers and Node alike**, so they must stay within the modern-browser baseline (ES2015+). Keep `src/**` ES5-ish in practice (`var`, no arrow functions, no `let`/`const`, no template literals, no spread, no `??`/`?.`, no `async`/`await`, no native classes). Flag a PR that "modernizes" `src/**` files without an explicit migration plan, because it raises the consumer baseline silently for every browser user.

Tests (`test/**`) and tooling (`scripts/**`, `eslint.config.mjs`) can use modern syntax freely — they don't ship.

### 6. Tests

- `npm test` runs `npm run build && vitest run`. Suggest that PR authors run this locally.
- `test/spec/Compatibility.spec.js` is the regression net for items 1–3. It covers Node ESM, Node CJS, and a simulated browser-globals environment (Node `vm` with `window` defined and no `module`/`exports`/`require`/`define`). If a PR touches `package.json`, `scripts/build.mjs`, `src/export.js`, or the build output, verify this spec still passes — and that the PR did not delete or weaken its assertions.
- Vitest's transformer is more permissive than real Node ESM. A unit spec passing is *not* sufficient evidence that ESM consumers still work; the compatibility spec (which spawns real `node` subprocesses) is.
- The simulated browser test catches UMD-branch logic regressions but is not a real browser. Don't suggest replacing it with a real-browser harness unless the PR is explicitly scoped to that.

## What not to flag

- The build script intentionally writes the build date into the banner, so `dist/*` artifacts will differ across rebuilds even with no source change. That is expected.
- The bundle emits `Zumba®` as a Unicode character (not the `&reg;` HTML entity). That is intentional — `dist/swivel.js` is JavaScript, not HTML.
- The `Array.prototype.reduce` polyfill that existed historically was removed when the Node floor moved to 20+ and the browser baseline to ES2015+. Don't suggest restoring it.
- `src/globals.js` keeps `var reduce = Array.prototype.reduce;` because the FeatureMap code calls `reduce.call(arguments, …)` on an arguments object. That is the canonical pattern; don't suggest replacing it with `Array.from(arguments).reduce(...)` or rest parameters in source files (see §5).
- Native browser ESM (`<script type="module" src="dist/swivel.js">`) is intentionally **not** supported as a direct consumption path. Don't suggest publishing an ESM-only build, an `exports` map, or an `import` entry — browser ESM consumers go through a bundler.

## Style preferences for suggestions

- 4-space indentation, single quotes, semicolons.
- Default to writing no comments. Suggest a comment only when the *why* is non-obvious (subtle invariant, workaround, hidden constraint). Do not annotate what the code does or reference task/PR numbers in code comments.
- Do not propose new runtime dependencies. The library ships with zero runtime deps and should stay that way.
- Do not propose backward-compatibility shims, dead-code re-exports, or `// removed: …` placeholders. Deletions should be clean.
