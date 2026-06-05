import { describe, it, expect, vi } from 'vitest';
import Swivel from '../../dist/swivel.js';

const Behavior = Swivel.Behavior;

describe('Behavior', () => {
    describe('execute', () => {
        it('should call the strategy with the arguments provided', () => {
            const strategy = vi.fn().mockReturnValue(123);
            const behavior = new Behavior('test', strategy);

            expect(behavior.execute(['a', 'b'])).toBe(123);
            expect(strategy).toHaveBeenCalledWith('a', 'b');
        });
    });
});
