import { describe, it, expect, vi } from 'vitest';
import Swivel from '../../dist/swivel.js';

const Bucket = Swivel.Bucket;
const FeatureMap = Swivel.FeatureMap;
const Behavior = Swivel.Behavior;

describe('Bucket', () => {
    describe('enabled', () => {
        it('should delegate to the injected FeatureMap', () => {
            const featureMap = new FeatureMap({ Test: [6], 'Test.version': [6] });
            const bucket = new Bucket(featureMap, 6);
            const behavior = new Behavior('Test.version', function() {});

            vi.spyOn(featureMap, 'enabled');
            expect(bucket.enabled(behavior)).toBe(true);
            expect(featureMap.enabled).toHaveBeenCalledWith('Test.version', 6);
        });
        it('should equal the slug sent in the callback', () => {
            const slug = 'InvalidSlug';
            const mapArray = {
                'Test': [1],
                'Test.version': [1],
                'Test.version.a': [1],
            };

            const map = new FeatureMap(mapArray);
            const behavior = new Behavior(slug, function() {});

            const bucket = new Bucket(map, 1, function(slugParam) {
                expect(slug).toEqual(slugParam);
            });

            vi.spyOn(map, 'enabled');
            expect(bucket.enabled(behavior)).toBe(false);
            expect(map.enabled).toHaveBeenCalledWith(slug, 1);
        });
    });
});
