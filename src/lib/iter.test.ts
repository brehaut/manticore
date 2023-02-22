import { describe, it, expect } from 'vitest';
import { range } from './iter.js';

const Arr = <T>(i:Iterable<T>) => Array.from(i);

describe('iter::range', () => {
	it('basic range', () => {
        expect(Arr(range(1,1))).toEqual([1]);
		expect(Arr(range(1,5))).toEqual([1,2,3,4,5]);
	});

    it('backwards args have zero length ranges', () => {
        expect(Arr(range(2,1))).toEqual([]);
    })
});

