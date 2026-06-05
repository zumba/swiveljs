# SwivelJS

> Strategy-driven, segmented feature toggles for JavaScript

SwivelJS is the JavaScript companion to the PHP [Swivel](https://github.com/zumba/swivel) library. It lets you ship code paths conditionally to a subset of users — feature flags, gradual rollouts, A/B tests — using the same feature-map format on the server and the client.

It runs in **modern browsers (ES2015+)** and **Node.js (>=20)**, and ships as a single UMD bundle with no runtime dependencies.

## Features

- Per-feature *strategies* (run code) and *values* (return data) — pick the right tool for each toggle.
- Hierarchical feature names (`Group.Feature.Variant`) with automatic parent-must-be-enabled checks.
- Compact bitmask representation — share the same feature map between server and client.
- `FeatureMap` operations (`add`, `merge`, `diff`, `intersect`) for combining or comparing toggle sets.
- Default fallback per feature, or opt out of defaults with `noDefault()`.
- Callback hook for unknown feature slugs, useful for telemetry on stale flags.
- Works in CJS, ESM, browser `<script>` tags, AMD loaders, and through any bundler.

## Installation

```sh
npm install swiveljs
```

Or load the prebuilt bundle directly in a browser:

```html
<script src="https://unpkg.com/swiveljs/dist/swivel.min.js"></script>
<script>
    // Swivel is now available on `window`
    const swivel = new Swivel({ map: { NewUI: [1, 2, 3] }, bucketIndex: 2 });
</script>
```

## Quick start

```js
const Swivel = require('swiveljs');

const swivel = new Swivel({
    map: {
        // Feature "NewCheckout" is enabled for users in buckets 1, 2, or 3
        NewCheckout: [1, 2, 3],
        // Feature "Search" is enabled for everyone in buckets 1–10
        Search: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        // Nested feature: "Search.Fuzzy" requires "Search" to also be enabled
        'Search.Fuzzy': [1, 2],
    },
    bucketIndex: 2,
});

// Run one of two strategies depending on the toggle
const total = swivel.invoke(
    'NewCheckout',
    () => calculateTotalV2(cart),
    () => calculateTotalV1(cart),
);

// Or return one of two values
const placeholder = swivel.returnValue('Search.Fuzzy', 'Try anything…', 'Search products');
```

## Concepts

### Buckets

Every user is assigned a **bucket index** (a positive integer, conventionally 1–10). You compute it however makes sense for your application — typically by hashing a user ID, session ID, or device ID into a stable bucket:

```js
function userBucket(userId) {
    return (hash(userId) % 10) + 1; // 1..10
}

const swivel = new Swivel({ map, bucketIndex: userBucket(currentUser.id) });
```

The bucket index becomes a bit position: index 1 → bit 0 (mask `1`), index 2 → bit 1 (mask `2`), … index N → bit `N-1`. Internally, an index range of 1–31 is supported, but production usage almost always sticks to 1–10 for parity with the PHP library.

### Feature maps

A feature map is a plain object where each key is a feature slug and each value is the list of bucket indices the feature is enabled for:

```js
{
    NewCheckout: [1, 2, 3],   // enabled for buckets 1, 2, 3
    LegacyExport: [],         // disabled for everyone
    StaffOnly: [10],          // enabled only for bucket 10
}
```

Behind the scenes, each array is folded into a single bitmask (e.g. `[1, 2, 3]` → `1 | 2 | 4` → `7`). Two equivalent ways to write a fully-disabled flag are `[]`, `[0]`, or `['']`.

### Nested features

Slugs may use a `.` delimiter to express hierarchy:

```js
const map = {
    Search: [1, 2, 3, 4, 5],
    'Search.Fuzzy': [1, 2],
    'Search.Fuzzy.Synonyms': [1],
};
```

A nested slug is enabled only when **every ancestor is also enabled** for the user's bucket. With `bucketIndex: 3`:

- `Search` → enabled (3 ∈ [1..5])
- `Search.Fuzzy` → disabled (3 ∉ [1, 2])
- `Search.Fuzzy.Synonyms` → disabled (ancestor `Search.Fuzzy` is off)

This makes it natural to gate variants behind their parent feature and turn off whole branches with a single flag.

## Usage

### Creating a Swivel instance

```js
const swivel = new Swivel({
    map: {              // optional, defaults to {}
        Feature: [1, 2, 3],
    },
    bucketIndex: 2,     // optional, the user's bucket
    callback: (slug) => {
        // optional, called when a slug is checked but not in the map
        console.warn(`Unknown feature: ${slug}`);
    },
});
```

`new Swivel(...)` and `Swivel(...)` (without `new`) are equivalent — the constructor self-`new`s.

### Builder API: `forFeature(slug)`

`forFeature` returns a `Builder` you chain to register behaviors, values, and a default, then `execute()` to run.

```js
const result = swivel.forFeature('Checkout')
    .addBehavior('v2', () => renderCheckoutV2(cart), [cart])
    .addBehavior('v3', () => renderCheckoutV3(cart), [cart])
    .defaultBehavior(() => renderCheckoutV1(cart), [cart])
    .execute();
```

The last enabled behavior wins. Behaviors are checked in chain order, but the most recent enabled one is the one that runs.

**Builder methods:**

| Method | Description |
| --- | --- |
| `addBehavior(slug, fn, args)` | Register a strategy under `Feature.slug`. Runs `fn(...args)` if enabled. |
| `addValue(slug, value)` | Register a literal value under `Feature.slug`. Returns `value` if enabled. |
| `defaultBehavior(fn, args)` | Fallback strategy if no other behavior is enabled. |
| `defaultValue(value)` | Fallback value if no other value is enabled. |
| `noDefault()` | Mark the builder as having no default. `execute()` returns `null` when no behavior matches. Throws if `defaultBehavior`/`defaultValue` is called afterwards. |
| `execute()` | Run the chosen behavior and return its result. |

`addBehavior` builds the full slug as `Feature.slug`, so the corresponding map entries must use the dotted form (and the parent must be enabled). `defaultBehavior` and `defaultValue` use the special sentinel slug — they always run when no other variant matched.

### Shorthand: `invoke` and `returnValue`

For the common "if enabled, do A, else do B" pattern, skip the Builder:

```js
// Run a strategy
swivel.invoke('Checkout.v2', renderV2, renderV1);

// Return a value
swivel.returnValue('Theme.dark', '#000', '#fff');
```

Both split the slug on `.`: the first part is the parent feature passed to `forFeature`, and the rest becomes the variant slug.

### Working with FeatureMap

The `FeatureMap` class is reachable both standalone and via the Swivel instance's bucket. Standalone:

```js
const { FeatureMap } = Swivel;

const base = new FeatureMap({ A: [1, 2], B: [3] });
const overrides = new FeatureMap({ A: [3, 4], C: [1] });

base.merge(overrides).map;
// { A: 12, B: 4, C: 1 }
// 'A' overridden by `overrides`; 'B' kept from base; 'C' added.

base.add(overrides).map;
// { A: 15, B: 4, C: 1 }
// 'A' bitmasks unioned (1|2|4|8 = 15).

base.intersect(overrides).map;
// {}
// Nothing matches exactly between the two.

base.diff(overrides).map;
// { A: 12, B: 4, C: 1 }
// Only entries that differ between the two maps.
```

| Method | Behavior |
| --- | --- |
| `add(map1, map2, …)` | Union of bitmasks per slug. Existing entries grow to include the new buckets. |
| `merge(map1, map2, …)` | Overwrite bitmasks per slug. Useful when a downstream config takes precedence. |
| `intersect(other)` | Keep only the slugs whose bitmasks match exactly. |
| `diff(other)` | Keep only the slugs that differ. Values come from `other` when both define the slug. |
| `enabled(slug, index)` | Direct bitmask check; usually you go through `Swivel.invoke` instead. |
| `slugExists(slug)` | True if the slug is present (regardless of bucket). |

`add` and `merge` accept any number of maps and apply them left-to-right.

> **Heads up:** `add` and `merge` mutate the receiver's internal `map` as a side effect of building the new `FeatureMap`. If you need to keep the original untouched, construct a fresh `FeatureMap` for each operation. `diff` and `intersect` are safe.

### Changing buckets at runtime

Switch a Swivel instance to a different bucket without rebuilding it:

```js
const { Bucket, FeatureMap } = Swivel;

swivel.setBucket(new Bucket(new FeatureMap(map), 7, callback));
```

Common use: serving an internal admin view that uses staff-only bucket 10 while continuing to render the customer's own bucket elsewhere.

### Reacting to unknown features

The `callback` option fires whenever `Bucket.enabled` is asked about a slug that isn't in the feature map. It receives the slug and is invoked once per check:

```js
const swivel = new Swivel({
    map: shippedFeatures,
    bucketIndex: userBucket,
    callback: (slug) => analytics.track('swivel.unknown_feature', { slug }),
});
```

This is the recommended hook for surfacing stale flag references during a deprecation cycle.

## Loading the bundle

SwivelJS ships as a single UMD bundle with five supported entry points:

### CommonJS (Node)

```js
const Swivel = require('swiveljs');
```

### ESM (Node)

```js
import Swivel from 'swiveljs';
```

Node resolves this through its CJS→ESM default-import interop on the same bundle. Named imports (`import { Behavior } from 'swiveljs'`) are not supported — read off the constructor: `Swivel.Behavior`.

### Browser `<script>` tag

```html
<script src="https://unpkg.com/swiveljs/dist/swivel.min.js"></script>
<script>
    new Swivel({ map, bucketIndex });
</script>
```

The bundle sets `window.Swivel` directly. Native ESM (`<script type="module">`) is intentionally not supported — use a bundler for browser ESM.

### Browser via a bundler

Webpack, Rollup, Vite, esbuild, and other bundlers consume the CJS resolution path:

```js
import Swivel from 'swiveljs';
```

The UMD wrapper is inlined into your bundle.

### AMD (RequireJS, etc.)

```js
define(['swiveljs'], function (Swivel) {
    // …
});
```

The bundle registers itself as `Swivel` via `define('Swivel', …)`.

## Browser and Node support

| Runtime | Supported |
| --- | --- |
| Node.js | 20.x and newer |
| Modern browsers | ES2015+ (Chrome, Edge, Firefox, Safari — current and recent versions) |
| Internet Explorer | Not supported (the bundle uses `Object.assign` natively) |

CI runs the test suite on the active LTS line; see `.github/workflows/ci.yml` for the exact matrix.

## Development

```sh
git clone https://github.com/zumba/swiveljs.git
cd swiveljs
npm install
npm test     # builds dist/ and runs the Vitest suite
npm run lint
npm run build
```

The build script (`scripts/build.mjs`) concatenates the source files in a fixed order, wraps them in the UMD IIFE, and minifies through Terser. Both `dist/swivel.js` and `dist/swivel.min.js` are committed to the repository so direct GitHub installs work without a build step.

If you change anything in `package.json`, `scripts/build.mjs`, or `src/export.js`, run `test/spec/Compatibility.spec.js` — it spawns real Node subprocesses to verify the bundle still loads via ESM, CJS, and a simulated browser-globals environment.

See `AGENTS.md` for the full set of compatibility invariants if you're working on the build or distribution path.

## Security

Please report vulnerabilities privately per [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Zumba
