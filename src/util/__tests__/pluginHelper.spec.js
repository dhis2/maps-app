import { didViewsChange } from '../pluginHelper.js'

describe('didViewsChange', () => {
    it.skip('should return true if the number of views has changed', () => {
        const oldViews = [{ filters: [], rows: [] }]
        const newViews = [
            { filters: [], rows: [] },
            { filters: [], rows: [] },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the number of filters has changed', () => {
        const oldViews = [{ filters: [{ items: [] }], rows: [] }]
        const newViews = [{ filters: [{ items: [] }, { items: [] }], rows: [] }]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the number of rows has changed', () => {
        const oldViews = [{ filters: [], rows: [{ items: [] }] }]
        const newViews = [{ filters: [], rows: [{ items: [] }, { items: [] }] }]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the filter items have changed', () => {
        const oldViews = [{ filters: [{ items: [{ id: '1' }] }], rows: [] }]
        const newViews = [{ filters: [{ items: [{ id: '2' }] }], rows: [] }]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the filter items have changed by adding one more', () => {
        const oldViews = [{ filters: [{ items: [{ id: '1' }] }], rows: [] }]
        const newViews = [
            { filters: [{ items: [{ id: '1' }, { id: '2' }] }], rows: [] },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the row items have changed', () => {
        const oldViews = [{ filters: [], rows: [{ items: [{ id: '1' }] }] }]
        const newViews = [{ filters: [], rows: [{ items: [{ id: '2' }] }] }]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the row items have changed by adding one more', () => {
        const oldViews = [{ filters: [], rows: [{ items: [{ id: '1' }] }] }]
        const newViews = [
            { filters: [], rows: [{ items: [{ id: '1' }, { id: '2' }] }] },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the order of the filter items has changed', () => {
        const oldViews = [
            { filters: [{ items: [{ id: '1' }, { id: '2' }] }], rows: [] },
        ]
        const newViews = [
            { filters: [{ items: [{ id: '2' }, { id: '1' }] }], rows: [] },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return true if the order of the row items has changed', () => {
        const oldViews = [
            { filters: [], rows: [{ items: [{ id: '1' }, { id: '2' }] }] },
        ]
        const newViews = [
            { filters: [], rows: [{ items: [{ id: '2' }, { id: '1' }] }] },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(true)
    })

    it('should return false if the views have not changed', () => {
        const oldViews = [
            {
                filters: [{ items: [{ id: '1' }] }],
                rows: [{ items: [{ id: '3' }] }],
            },
        ]
        const newViews = [
            {
                filters: [{ items: [{ id: '1' }] }],
                rows: [{ items: [{ id: '3' }] }],
            },
        ]
        expect(didViewsChange(oldViews, newViews)).toEqual(false)
    })
})
