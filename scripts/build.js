#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
 * Copyright (c) ${new Date().getFullYear()} Zumba\u00ae
 * Licensed ${pkg.license}
 */`;

const body = srcFiles
    .map(f => readFileSync(join(root, f), 'utf8'))
    .join('\n');

const wrapped = `;(function SwivelJS(undefined) {\n    'use strict';\n${body}\n}.call(this));`;
const output = `${banner}\n${wrapped}\n`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/swivel.js'), output);
console.log('Built dist/swivel.js');

execSync(
    'npx terser dist/swivel.js --compress drop_console=true --mangle --source-map "filename=swivel.min.js.map,url=swivel.min.js.map" -o dist/swivel.min.js',
    { cwd: root, stdio: 'inherit' }
);
console.log('Built dist/swivel.min.js');
