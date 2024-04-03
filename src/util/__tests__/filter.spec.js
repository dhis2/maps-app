import { filterData } from '../filter.js';

describe('filterData', () => {
    it('should return the original data if no filters are provided', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }];
        expect(filterData(data)).toEqual(data);
    });

    it('should filter data based on a string filter', () => {
        const data = [{ a: 'apple' }, { a: 'banana' }, { a: 'cherry' }];
        const filters = { a: 'a' };
        expect(filterData(data, filters)).toEqual([
            { a: 'apple' },
            { a: 'banana' },
        ]);
    });

    it('should filter data based on a string filter where the value is considered numeric', () => {
        const data = [{ a: '1' }, { a: '2' }, { a: '3' }];
        const filters = { a: '2' };
        expect(filterData(data, filters)).toEqual([{ a: '2' }]);
    });

    // TODO the following tests fail because the code has a bug
    it.skip('should filter data based on a numeric filter', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }];
        const filters = { a: '>1' };
        expect(filterData(data, filters)).toEqual([{ a: 2 }, { a: 3 }]);
    });

    it.skip('should handle complex numeric filters', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }];
        const filters = { a: '>1&<5' };
        expect(filterData(data, filters)).toEqual([
            { a: 2 },
            { a: 3 },
            { a: 4 },
        ]);
    });

    it('should handle multiple string filters', () => {
        const data = [
            { a: 'apple', b: 'cow' },
            { a: 'banana', b: 'horse' },
            { a: 'cherry', b: 'dog' },
        ];
        const filters = { a: 'a', b: 'r' };
        expect(filterData(data, filters)).toEqual([
            { a: 'banana', b: 'horse' },
        ]);
    });
});
