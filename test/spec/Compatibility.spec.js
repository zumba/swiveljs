import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const distJs = join(root, 'dist/swivel.js');
const distMin = join(root, 'dist/swivel.min.js');

const apiAssertions = `
    if (typeof Swivel !== 'function') { console.error('Swivel is not a function'); process.exit(1); }
    if (typeof Swivel.Behavior !== 'function') { console.error('Swivel.Behavior missing'); process.exit(2); }
    if (typeof Swivel.Bucket !== 'function') { console.error('Swivel.Bucket missing'); process.exit(3); }
    if (typeof Swivel.Builder !== 'function') { console.error('Swivel.Builder missing'); process.exit(4); }
    if (typeof Swivel.FeatureMap !== 'function') { console.error('Swivel.FeatureMap missing'); process.exit(5); }
    const s = new Swivel({ map: { a: [1] }, bucketIndex: 1 });
    if (typeof s.forFeature !== 'function') { console.error('instance.forFeature missing'); process.exit(6); }
    if (s.returnValue('a', 'on', 'off') !== 'on') { console.error('returnValue mismatch'); process.exit(7); }
    console.log('ok');
`;

const esmScript = (path) => `import Swivel from ${JSON.stringify(path)};\n${apiAssertions}`;
const cjsScript = (path) => `const Swivel = require(${JSON.stringify(path)});\n${apiAssertions}`;

const runNode = (args, source) => execFileSync(
    process.execPath,
    [...args, '-e', source],
    { encoding: 'utf8', cwd: root }
).trim();

describe('dist compatibility', () => {
    it('dist/swivel.js exists', () => {
        expect(existsSync(distJs)).toBe(true);
    });

    it('dist/swivel.min.js exists', () => {
        expect(existsSync(distMin)).toBe(true);
    });

    it('dist/swivel.js is consumable from real Node ESM (default import)', () => {
        expect(runNode(['--input-type=module'], esmScript(distJs))).toBe('ok');
    });

    it('dist/swivel.js is consumable from CJS (require)', () => {
        expect(runNode([], cjsScript(distJs))).toBe('ok');
    });

    it('dist/swivel.min.js is consumable from real Node ESM (default import)', () => {
        expect(runNode(['--input-type=module'], esmScript(distMin))).toBe('ok');
    });

    it('dist/swivel.min.js is consumable from CJS (require)', () => {
        expect(runNode([], cjsScript(distMin))).toBe('ok');
    });

    it('dist/swivel.js preserves the license banner', () => {
        const content = readFileSync(distJs, 'utf8');
        expect(content).toMatch(/SwivelJS v\d+\.\d+\.\d+/);
        expect(content).toMatch(/Copyright \(c\) \d{4} Zumba/);
        expect(content).toMatch(/Licensed MIT/);
    });

    it('dist/swivel.min.js preserves the license banner', () => {
        const content = readFileSync(distMin, 'utf8');
        expect(content).toMatch(/SwivelJS v\d+\.\d+\.\d+/);
        expect(content).toMatch(/Copyright \(c\) \d{4} Zumba/);
        expect(content).toMatch(/Licensed MIT/);
    });

    const runInBrowserLikeContext = (path) => {
        const code = readFileSync(path, 'utf8');
        const window = {};
        const context = vm.createContext({ window });
        vm.runInContext(code, context);
        return window;
    };

    it('dist/swivel.js attaches Swivel to window in a browser-like environment', () => {
        const { Swivel } = runInBrowserLikeContext(distJs);
        expect(typeof Swivel).toBe('function');
        expect(typeof Swivel.Behavior).toBe('function');
        expect(typeof Swivel.Bucket).toBe('function');
        expect(typeof Swivel.Builder).toBe('function');
        expect(typeof Swivel.FeatureMap).toBe('function');
        const s = new Swivel({ map: { a: [1] }, bucketIndex: 1 });
        expect(s.returnValue('a', 'on', 'off')).toBe('on');
    });

    it('dist/swivel.min.js attaches Swivel to window in a browser-like environment', () => {
        const { Swivel } = runInBrowserLikeContext(distMin);
        expect(typeof Swivel).toBe('function');
        expect(typeof Swivel.Behavior).toBe('function');
        expect(typeof Swivel.Bucket).toBe('function');
        expect(typeof Swivel.Builder).toBe('function');
        expect(typeof Swivel.FeatureMap).toBe('function');
        const s = new Swivel({ map: { a: [1] }, bucketIndex: 1 });
        expect(s.returnValue('a', 'on', 'off')).toBe('on');
    });
});
