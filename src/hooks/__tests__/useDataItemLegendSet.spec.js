import { renderHook } from '@testing-library/react'
import useDataItemLegendSet from '../useDataItemLegendSet.js'

let mockQuery

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({ query: mockQuery }),
}))

describe('useDataItemLegendSet', () => {
    beforeEach(() => {
        mockQuery = jest.fn()
    })

    it('returns null and does not query for a type with no configured resource', async () => {
        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'EXPRESSION_DIMENSION_ITEM',
            id: 'item1',
        })

        expect(legendSet).toBe(null)
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('returns null and does not query when the item has no id', async () => {
        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'INDICATOR',
            id: undefined,
        })

        expect(legendSet).toBe(null)
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('queries the item resource directly by id for a simple type', async () => {
        mockQuery.mockResolvedValue({
            legendSet: { legendSet: { id: 'ls1' } },
        })

        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'INDICATOR',
            id: 'ind1',
        })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'indicators/ind1',
                params: { fields: 'legendSet' },
            },
        })
        expect(legendSet).toEqual({ id: 'ls1' })
    })

    it('extracts the data set id for a reporting rate item', async () => {
        mockQuery.mockResolvedValue({ legendSet: { legendSet: null } })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({
            type: 'REPORTING_RATE',
            id: 'ds1.REPORTING_RATE',
        })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'dataSets/ds1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('extracts the attribute uid for a program attribute item', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({
            type: 'PROGRAM_ATTRIBUTE',
            id: 'prog1.attr1',
        })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'trackedEntityAttributes/attr1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('returns null without querying when a program attribute id has no program prefix', async () => {
        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'PROGRAM_ATTRIBUTE',
            id: 'attr1',
        })

        expect(legendSet).toBe(null)
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('extracts the data element uid for a program data element item', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({
            type: 'PROGRAM_DATA_ELEMENT',
            id: 'prog1.de1',
        })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'dataElements/de1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('queries the resource directly by id for a data element item', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({ type: 'DATA_ELEMENT', id: 'de1' })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'dataElements/de1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('queries the resource directly by id for a data set item', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({ type: 'DATA_SET', id: 'ds1' })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'dataSets/ds1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('queries the resource directly by id for a program indicator item', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        await result.current({ type: 'PROGRAM_INDICATOR', id: 'pi1' })

        expect(mockQuery).toHaveBeenCalledWith({
            legendSet: {
                resource: 'programIndicators/pi1',
                params: { fields: 'legendSet' },
            },
        })
    })

    it('returns null and does not query for a program data element option item', async () => {
        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'PROGRAM_DATA_ELEMENT_OPTION',
            id: 'item1',
        })

        expect(legendSet).toBe(null)
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('returns null when the query result has no legend set', async () => {
        mockQuery.mockResolvedValue({ legendSet: {} })

        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'INDICATOR',
            id: 'ind1',
        })

        expect(legendSet).toBe(null)
    })

    it('returns null when the query rejects', async () => {
        mockQuery.mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() => useDataItemLegendSet())

        const legendSet = await result.current({
            type: 'INDICATOR',
            id: 'ind1',
        })

        expect(legendSet).toBe(null)
    })
})
