# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Aider, etc.) working in this repository.

## What this library is

SwivelJS is a small, strategy-driven feature-toggle library used on **both server (Node) and client (browser)**. It is distributed as a single UMD bundle (`dist/swivel.js`) and its minified counterpart (`dist/swivel.min.js`).

Supported consumption paths — **every one is load-bearing**:

- **CommonJS Node** via `require('swiveljs')` → returns the `Swivel` constructor (with `Behavior`/`Bucket`/`Builder`/`FeatureMap` attached as static properties).
- **ESM Node** via `import Swivel from 'swiveljs'` → resolves through Node's CJS→ESM default-import interop on the same UMD `module.exports = Swivel`.
- **Browser `<script>` tag** loading `dist/swivel.js` or `dist/swivel.min.js` directly → sets `window.Swivel`.
- **Browser via a bundler** (webpack, rollup, vite, esbuild) → bundlers consume the package using its CJS resolution and inline the UMD bundle.
- **AMD loaders** (RequireJS, etc.) → the wrapper calls `define('Swivel', …)`.

The library targets **modern browsers (ES2015+)**. The binding constraint is `Object.assign` in `FeatureMap.diff` — IE is **not** supported. Native browser ESM (`<script type="module">`) loading the dist file directly is **not** a supported path; browser ESM consumers must go through a bundler.

Do not break any of the consumer paths above without an explicit instruction.

## Hard compatibility requirements

These are not preferences — they are tested invariants (`test/spec/Compatibility.spec.js`). Before changing any of the items below, read that file and update the tests deliberately.

1. **Do not set `"type": "module"` in `package.json`.** The published bundle is UMD, not ESM. Marking the package as ESM makes Node parse `dist/swivel.js` as an ES module, which fails because the bundle has no `export` statements. ESM consumers work today *because* the package is CJS and Node's CJS→ESM interop hands them `module.exports` as `default`. Vitest's transformer is more forgiving than real Node, so the spec tests can pass even when real consumers are broken — trust the compatibility spec, not the unit specs.

2. **Keep the license banner in both `dist/swivel.js` and `dist/swivel.min.js`.** The banner contains the version, build date, copyright, and license. The minified bundle's banner is added via Terser's `format.preamble` option in `scripts/build.mjs` — do not switch to a Terser invocation that omits this.

3. **Keep the UMD wrapper in `src/export.js` intact.** The export-detection block (AMD → CommonJS → globals) is what makes the bundle work in every consumer environment. Don't "modernize" it to a single `export default Swivel`. In particular, the trailing `else { root.Swivel = Swivel; }` is the browser-`<script>` path — removing it silently breaks every direct-`<script>` consumer.

4. **`new Swivel(...)` and `Swivel(...)` must both work.** The constructor self-`new`s when called without `new` — preserve that behavior.

5. **Public API surface:** `Swivel`, `Swivel.Behavior`, `Swivel.Bucket`, `Swivel.Builder`, `Swivel.FeatureMap`, and the instance methods `forFeature`, `invoke`, `returnValue`, `setBucket`. Renaming, removing, or restructuring any of these is a breaking change.

## Build pipeline

`npm run build` runs `scripts/build.mjs`, which:

1. Concatenates the source files in this exact order: `src/globals.js`, `src/Swivel/Behavior.js`, `src/Swivel/Bucket.js`, `src/Swivel/Builder.js`, `src/Swivel/FeatureMap.js`, `src/Swivel/Swivel.js`, `src/export.js`.
2. Wraps the concatenated source in `;(function SwivelJS(undefined) { 'use strict'; … }.call(this));` with 4-space body indentation. The IIFE provides `undefined` as a guaranteed-undefined token and `this` as the global object (browser `window` / Node `global`) for the UMD detection.
3. Prepends the license banner *inside* the IIFE (after `'use strict'`).
4. Minifies via the Terser Node API with `compress.drop_console: true`, `mangle: true`, `format.preamble: banner`, and an external source map.

If you need to add a new source file, add it to `srcFiles` in `scripts/build.mjs` and re-run `npm run build`. Do not add it via a glob — order matters because the bundle relies on var-hoisting and top-down declaration.

## ESM-syntax files

The package is CJS, but a few build/lint files use `import`. To keep `import` syntax working without flipping the whole package to ESM, those files use the `.mjs` extension:

- `scripts/build.mjs`
- `eslint.config.mjs`

If you add another tooling script that needs `import`, give it an `.mjs` extension. Source files (`src/**/*.js`) and test files (`test/**/*.js`) stay `.js`.

## Testing

- **`npm test`** runs `npm run build && vitest run`. Always run this before reporting work complete; the test step depends on a fresh build.
- **`npm run lint`** runs ESLint on `dist/swivel.js`, the `test/` and `scripts/` directories, and the ESLint config itself.

There are two layers of tests:

- **Unit specs** (`test/spec/{Behavior,Bucket,Builder,FeatureMap,Swivel}.spec.js`) — verify library behavior via the in-process Vitest import. Convenient, but Vitest's transformer can hide consumption regressions.
- **Compatibility spec** (`test/spec/Compatibility.spec.js`) — spawns a real `node` subprocess to load the dist bundles via ESM `import` and CJS `require()`, runs the bundle inside a simulated browser context (Node `vm` with `window` defined and no `module`/`exports`/`require`) to verify `window.Swivel` is set, and checks that the banner is present. **This is the regression net** for items 1–3 above. If you touch `package.json`, `scripts/build.mjs`, or `src/export.js`, run this spec specifically. The simulated-browser test catches UMD-branch logic regressions but is not a real browser — it does not exercise DOM behavior.

## Runtime baselines and toolchain

- **Node:** `>=20` (declared in `package.json`'s `engines`).
- **Browsers:** modern only — ES2015+. The bundle uses `Object.assign` (in `FeatureMap.diff`) and `Array.prototype.reduce` natively, so IE 11 and older are explicitly **not** supported. Don't add code that raises the baseline further (no `??`, `?.`, `async`/`await`, native classes, etc.) in `src/**` without an explicit migration plan, because the bundle ships unchanged to browser consumers.
- CI matrix lives in `.github/workflows/ci.yml`; the publish matrix lives in `.github/workflows/npm-publish.yml`. Keep them in sync with the engines field when raising the floor.
- Source files target ES5-ish syntax (`var`, no arrow functions, no `let`/`const`, no template literals) for the same reason. Tests and tooling are free to use modern syntax.

## Style conventions

- 4-space indentation, single quotes, semicolons.
- Default to writing *no* comments. Only add a comment when a future reader could not reasonably infer the *why* from the code (e.g., a subtle invariant or a workaround). Do not narrate what the code does or reference tasks/PRs/incidents in code comments.
- Don't add backward-compatibility shims, feature flags, or "// removed" placeholders. Delete cleanly.
- Don't introduce new runtime dependencies. The library has none and should stay that way. Devtool dependencies are fine if they replace something.

## When in doubt

If a change feels like it might affect how consumers load the bundle, the answer is almost always: run `test/spec/Compatibility.spec.js`. If it passes after your change, the contract is intact.
