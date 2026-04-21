import { describe, it, expect } from 'vitest';
import Swivel from '../../dist/swivel.js';

const FeatureMap = Swivel.FeatureMap;

describe('FeatureMap', () => {
    describe('parse', () => {
        it('should parse maps into maps of bitmasks', () => {
            let map = { a: [6, 7], 'a.b': [7] };
            let parsed = (new FeatureMap(map)).map;
            expect(parsed.a).toBe(32 | 64);
            expect(parsed['a.b']).toBe(64);

            map = { a: [''] };
            parsed = (new FeatureMap(map)).map;
            expect(parsed.a).toBe(0);

            map = { a: [0] };
            parsed = (new FeatureMap(map)).map;
            expect(parsed.a).toBe(0);

            map = { a: [0, 1] };
            parsed = (new FeatureMap(map)).map;
            expect(parsed.a).toBe(1);
        });
    });
    describe('add', () => {
        it('should add multiple maps together and return a new map', () => {
            const map1 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], c: [7] });
            const map2 = new FeatureMap({ a: [2, 3, 4], b: [4, 5, 6], d: [7] });
            const map3 = new FeatureMap({ a: [4, 5], d: [9, 10], e: [7] });
            const expected = {
                a: 1 | 2 | 4 | 8 | 16,
                b: 8 | 16 | 32,
                c: 64,
                d: 64 | 256 | 512,
                e: 64,
            };
            const result = map1.add(map2, map3).map;
            for (const key in expected) {
                if (Object.prototype.hasOwnProperty.call(expected, key)) {
                    expect(expected[key]).toBe(result[key]);
                }
            }
        });
    });
    describe('diff', () => {
        it('should find the diff between two maps and return a new map', () => {
            const map1 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map2 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map1.diff(map2).map).toEqual({});

            const map3 = new FeatureMap({ a: [1, 2], b: [4, 5, 6] });
            const map4 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map3.diff(map4).map).toEqual({ a: 1 | 2 | 4 });

            const map5 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], c: [7] });
            const map6 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map5.diff(map6).map).toEqual({ c: 64 });

            const map7 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map8 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], d: [1] });
            expect(map7.diff(map8).map).toEqual({ d: 1 });

            const map9 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], c: [7] });
            const map10 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], d: [1] });
            expect(map9.diff(map10).map).toEqual({ c: 64, d: 1 });

            const map11 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map12 = new FeatureMap({ a: [], b: [] });
            expect(map11.diff(map12).map).toEqual({ a: 0, b: 0 });
        });
    });
    describe('enabled', () => {
        it('should compare the slug to the map and indicate if the feature is enabled', () => {
            const map0 = new FeatureMap({ 'Test': [], 'Test.version': [], 'Test.version.a': [0] });
            expect(map0.enabled('Test', 1)).toBe(false);
            expect(map0.enabled('Test.version', 1)).toBe(false);
            expect(map0.enabled('Test.version.a', 1)).toBe(false);

            const map1 = new FeatureMap({ 'Test': [1], 'Test.version': [1], 'Test.version.a': [1] });
            expect(map1.enabled('Test', 1)).toBe(true);
            expect(map1.enabled('Test.version', 1)).toBe(true);
            expect(map1.enabled('Test.version.a', 1)).toBe(true);

            const map2 = new FeatureMap({ 'Test': [1], 'Test.version': [1], 'Test.version.a': [] });
            expect(map2.enabled('Test', 1)).toBe(true);
            expect(map2.enabled('Test.version', 1)).toBe(true);
            expect(map2.enabled('Test.version.a', 1)).toBe(false);

            const map3 = new FeatureMap({ 'Test': [], 'Test.version': [1], 'Test.version.a': [1] });
            expect(map3.enabled('Test', 1)).toBe(false);
            expect(map3.enabled('Test.version', 1)).toBe(false);
            expect(map3.enabled('Test.version.a', 1)).toBe(false);

            const map4 = new FeatureMap({ 'Test': [1], 'Test.version': [], 'Test.version.a': [1] });
            expect(map4.enabled('Test', 1)).toBe(true);
            expect(map4.enabled('Test.version', 1)).toBe(false);
            expect(map4.enabled('Test.version.a', 1)).toBe(false);

            const map5 = new FeatureMap({ 'Test': [], 'Test.version': [], 'Test.version.a': [] });
            expect(map5.enabled('Test', 1)).toBe(false);
            expect(map5.enabled('Test.version', 1)).toBe(false);
            expect(map5.enabled('Test.version.a', 1)).toBe(false);

            const map6 = new FeatureMap({ 'Test': [2, 3, 5], 'Test.version': [2, 3], 'Test.version.a': [3] });
            expect(map6.enabled('Test', 1)).toBe(false);
            expect(map6.enabled('Test', 2)).toBe(true);
            expect(map6.enabled('Test', 3)).toBe(true);
            expect(map6.enabled('Test', 5)).toBe(true);
            expect(map6.enabled('Test.version', 1)).toBe(false);
            expect(map6.enabled('Test.version', 2)).toBe(true);
            expect(map6.enabled('Test.version', 3)).toBe(true);
            expect(map6.enabled('Test.version', 5)).toBe(false);
            expect(map6.enabled('Test.version.a', 1)).toBe(false);
            expect(map6.enabled('Test.version.a', 2)).toBe(false);
            expect(map6.enabled('Test.version.a', 3)).toBe(true);
            expect(map6.enabled('Test.version.a', 5)).toBe(false);
        });
    });
    describe('slugExists', () => {
        it('should return correct results', () => {
            const map = new FeatureMap({ a: [1] });
            expect(map.slugExists('a')).toBe(true);
            expect(map.slugExists('b')).toBe(false);
        });
    });
    describe('intersect', () => {
        it('should find the intersection between two maps and return a new map', () => {
            const map1 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map2 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map1.intersect(map2).map).toEqual({ a: 1 | 2 | 4, b: 8 | 16 | 32 });

            const map3 = new FeatureMap({ a: [1, 2], b: [4, 5, 6] });
            const map4 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map3.intersect(map4).map).toEqual({ b: 8 | 16 | 32 });

            const map5 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], c: [7] });
            const map6 = new FeatureMap({ a: [2, 3, 4], b: [4, 5, 6] });
            expect(map5.intersect(map6).map).toEqual({ b: 8 | 16 | 32 });

            const map7 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map8 = new FeatureMap({ a: [1, 2, 3], b: [9, 8, 7], d: [1] });
            expect(map7.intersect(map8).map).toEqual({ a: 1 | 2 | 4 });
        });
    });
    describe('merge', () => {
        it('should merge two maps and return a new map', () => {
            const map1 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map2 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map1.merge(map2).map).toEqual({ a: 1 | 2 | 4, b: 8 | 16 | 32 });

            const map3 = new FeatureMap({ a: [1, 2], b: [4, 5, 6] });
            const map4 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            expect(map3.merge(map4).map).toEqual({ a: 1 | 2 | 4, b: 8 | 16 | 32 });

            const map5 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6], c: [7] });
            const map6 = new FeatureMap({ a: [2, 3, 4], b: [4, 5, 6] });
            expect(map5.merge(map6).map).toEqual({ a: 2 | 4 | 8, b: 8 | 16 | 32, c: 64 });

            const map7 = new FeatureMap({ a: [1, 2, 3], b: [4, 5, 6] });
            const map8 = new FeatureMap({ a: [1, 2, 3], b: [9, 8, 7], d: [1] });
            expect(map7.merge(map8).map).toEqual({ a: 1 | 2 | 4, b: 256 | 128 | 64, d: 1 });
        });
    });
});
