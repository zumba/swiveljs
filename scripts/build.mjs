#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const srcFiles = [
    'src/globals.js',
    'src/Swivel/Behavior.js',
    'src/Swivel/Bucket.js',
    'src/Swivel/Builder.js',
    'src/Swivel/FeatureMap.js',
    'src/Swivel/Swivel.js',
    'src/export.js',
];

const today = new Date().toISOString().slice(0, 10);
const banner = `/**
 * SwivelJS v${pkg.version} - ${today}
 * ${pkg.description}
 *
 * Copyright (c) ${new Date().getFullYear()} Zumba®
 * Licensed ${pkg.license}
 */`;

const indent = '    ';
const body = srcFiles
    .map(f => readFileSync(join(root, f), 'utf8'))
    .join('\n');

const indented = (banner + '\n' + body)
    .split('\n')
    .map(line => (line.length ? indent + line : line))
    .join('\n');

const output = `;(function SwivelJS(undefined) {\n${indent}'use strict';\n${indented}\n}.call(this));\n`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/swivel.js'), output);
console.log('Built dist/swivel.js');

const minified = await minify(output, {
    compress: { drop_console: true },
    mangle: true,
    format: { preamble: banner },
    sourceMap: {
        filename: 'swivel.min.js',
        url: 'swivel.min.js.map',
    },
});

writeFileSync(join(root, 'dist/swivel.min.js'), minified.code);
writeFileSync(join(root, 'dist/swivel.min.js.map'), minified.map);
console.log('Built dist/swivel.min.js');
