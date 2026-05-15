import { describe, it, expect, vi } from 'vitest';
import Swivel from '../../dist/swivel.js';

const Builder = Swivel.Builder;
const Behavior = Swivel.Behavior;

describe('Builder', () => {
    describe('addBehavior', () => {
        it('will not add disabled behaviors', () => {
            const strategy = function() {};
            const bucket = { enabled: vi.fn().mockReturnValue(false) };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.addBehavior('a', strategy, ['test']);

            expect(getBehavior).toHaveBeenCalledWith('a', strategy);
            expect(bucket.enabled).toHaveBeenCalledWith(behavior);
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBeNull();
            expect(builder.args).toEqual([]);
        });
        it('will add an enabled behavior', () => {
            const strategy = function() {};
            const bucket = { enabled: vi.fn().mockReturnValue(true) };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.addBehavior('a', strategy, ['test']);

            expect(getBehavior).toHaveBeenCalledWith('a', strategy);
            expect(bucket.enabled).toHaveBeenCalledWith(behavior);
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBe(behavior);
            expect(builder.args).toEqual(['test']);
        });
    });
    describe('addValue', () => {
        it('will not add disabled values', () => {
            const bucket = { enabled: vi.fn().mockReturnValue(false) };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.addValue('a', 'test');

            expect(getBehavior).toHaveBeenCalledWith('a', expect.any(Function));
            expect(bucket.enabled).toHaveBeenCalledWith(behavior);
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBeNull();
            expect(builder.args).toEqual([]);
        });
        it('will add an enabled behavior', () => {
            const bucket = { enabled: vi.fn().mockReturnValue(true) };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.addValue('a', 'test');

            expect(getBehavior).toHaveBeenCalledWith('a', expect.any(Function));
            expect(bucket.enabled).toHaveBeenCalledWith(behavior);
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBe(behavior);
            expect(builder.args).toEqual([]);
        });
    });
    describe('defaultBehavior', () => {
        it('will add a default behavior', () => {
            const strategy = function() {};
            const bucket = { enabled: vi.fn() };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.defaultBehavior(strategy, ['test']);

            expect(getBehavior).toHaveBeenCalledWith(strategy);
            expect(bucket.enabled).not.toHaveBeenCalled();
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBe(behavior);
            expect(builder.args).toEqual(['test']);
        });
    });
    describe('defaultValue', () => {
        it('will add a default value', () => {
            const bucket = { enabled: vi.fn() };
            const behavior = { execute: vi.fn() };
            const builder = new Builder('Test', bucket);
            const getBehavior = vi.spyOn(builder, 'getBehavior').mockReturnValue(behavior);

            builder.defaultValue('test');

            expect(getBehavior).toHaveBeenCalledWith(expect.any(Function));
            expect(bucket.enabled).not.toHaveBeenCalled();
            expect(behavior.execute).not.toHaveBeenCalled();
            expect(builder.behavior).toBe(behavior);
            expect(builder.args).toEqual([]);
        });
    });
    describe('getBehavior', () => {
        it('should get a behavior', () => {
            const builder = new Builder('Test', {});
            const behavior = builder.getBehavior('a', function() {});

            expect(behavior instanceof Behavior).toBe(true);
            expect(behavior.slug).toBe('Test.a');
        });
        it('should accept functions returning falsey values', () => {
            const builder = new Builder('Test', {});
            const behavior = builder.getBehavior('a', function() { return 0; });

            expect(behavior instanceof Behavior).toBe(true);
            expect(behavior.execute()).toBe(0);
        });
        it('should return behavior with builder slug regardless of getBehavior callback', () => {
            const builder = new Builder('Test', {});
            const behavior = builder.getBehavior('', function() { return 'notTest'; });

            expect(behavior instanceof Behavior).toBe(true);
            expect(behavior.slug).toBe('Test');
        });
    });
});
