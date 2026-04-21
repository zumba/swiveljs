import { describe, it, expect, vi } from 'vitest';
import Swivel from '../../dist/swivel.js';

const Builder = Swivel.Builder;

describe('Swivel', () => {
    describe('Constructor', () => {
        it("should allow the use of 'new'", () => {
            expect(new Swivel() instanceof Swivel).toBe(true);
        });
        it('creates a new instance if called like a function', () => {
            expect(Swivel() instanceof Swivel).toBe(true);
        });
        it('should have a bucket with an empty callback function', () => {
            const swivel = new Swivel({
                callback: function() { return 'Test'; },
            });
            expect(swivel.bucket.callback()).toBe('Test');
        });
        it('should have a bucket with a valid callback function', () => {
            const swivel = new Swivel();
            expect(swivel.bucket.callback()).toBe(undefined);
        });
    });
    describe('returnValue', () => {
        it('should equal to default value', () => {
            const swivel = new Swivel();
            expect(swivel.returnValue('slug', 'custom', 'default')).toBe('default');
        });
        it('should equal to custom value', () => {
            const swivel = new Swivel();
            const forFeature = vi.spyOn(swivel, 'forFeature');
            const bucket = { enabled: vi.fn().mockReturnValue(true) };
            const builder = new Builder('Test', bucket);

            forFeature.mockReturnValue(builder);
            expect(swivel.returnValue('slug', 'custom', 'default')).toBe('custom');
        });
    });
});
