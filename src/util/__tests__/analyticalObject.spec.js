import {
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
    getAnalyticalObjectFromThematicLayer,
} from '../analyticalObject.js'

const dataItems = [{ id: 'test' }]
const dataDim = {
    dimension: 'dx',
    items: dataItems,
}
const columns = [dataDim]
const rows = [
    {
        dimension: 'ou',
        items: [],
    },
]
const filters = [
    {
        dimension: 'pe',
        items: [],
    },
]
const aggregationType = 'average'

// Mock out legend set loading
jest.mock('../legend')

describe('analytical object utils', () => {
    describe('analytical object handling', () => {
        it('returns data items from columns in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                columns,
            })
            expect(result).toEqual(dataItems)
        })

        it('returns data items from rows in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                rows: [dataDim],
            })
            expect(result).toEqual(dataItems)
        })

        it('returns data items from filters in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({
                filters: [dataDim],
            })
            expect(result).toEqual(dataItems)
        })

        it('returns empty array if no data dimensions in analytical object', () => {
            const result = getDataDimensionsFromAnalyticalObject({})
            expect(result).toEqual([])
        })

        it('returns undefined if no data dimension is passed', async () => {
            const result = await getThematicLayerFromAnalyticalObject({})
            expect(result).toBeUndefined()
        })

        it('returns undefined if no org unit dimension is passed', async () => {
            const result = await getThematicLayerFromAnalyticalObject({
                ao: {
                    columns,
                },
            })
            expect(result).toBeUndefined()
        })

        it('returns undefined if no period dimension is passed', async () => {
            const result = await getThematicLayerFromAnalyticalObject({
                ao: {
                    columns,
                    rows,
                },
            })
            expect(result).toBeUndefined()
        })

        it('returns layer object if data, org unit and period dimensions are passed', async () => {
            const result = await getThematicLayerFromAnalyticalObject({
                ao: {
                    columns,
                    rows,
                    filters,
                },
            })

            expect(result).toBeInstanceOf(Object)
        })

        it('returns default values for analytical oobject properties', async () => {
            const result = await getAnalyticalObjectFromThematicLayer()

            expect(result).toBeInstanceOf(Object)
            expect(result.columns).toBeInstanceOf(Array)
            expect(result.rows).toBeInstanceOf(Array)
            expect(result.filters).toBeInstanceOf(Array)
            expect(result.aggregationType).toEqual('DEFAULT')
        })

        it('keeps columns, rows, filters and aggregationType and skips other properties', async () => {
            const result = await getAnalyticalObjectFromThematicLayer({
                id: 'abc',
                rows,
                columns,
                filters,
                aggregationType,
            })

            expect(result.columns).toEqual(columns)
            expect(result.rows).toEqual(rows)
            expect(result.filters).toEqual(filters)
            expect(result.aggregationType).toEqual(aggregationType)
            expect(result.id).toBeUndefined()
        })
    })
})
