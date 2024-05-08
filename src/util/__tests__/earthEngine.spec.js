import { getStaticFilterFromPeriod } from '../earthEngine.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('earth engine utils', () => {
    it('get static filter from dynamic filter and period', () => {
        let period = { id: '202312' }
        let dynamicFilter = [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ]
        let staticFilter = getStaticFilterFromPeriod(period, dynamicFilter)
        expect(staticFilter).not.toEqual(dynamicFilter)
        expect(staticFilter.length).toEqual(dynamicFilter.length)
        expect(staticFilter[0].arguments[1]).toEqual(period.id)

        period = { id: 2020 }
        dynamicFilter = [
            {
                type: 'eq',
                arguments: ['year', '$1'],
            },
        ]
        staticFilter = getStaticFilterFromPeriod(period, dynamicFilter)
        expect(staticFilter).not.toEqual(dynamicFilter)
        expect(staticFilter.length).toEqual(dynamicFilter.length)
        expect(staticFilter[0].arguments[1]).toEqual(period.id)

        period = { id: 2020 }
        dynamicFilter = [
            {
                type: 'eq',
                arguments: ['year', '$1'],
            },
            {
                type: 'eq',
                arguments: ['UNadj', 'yes'],
            },
        ]
        staticFilter = getStaticFilterFromPeriod(period, dynamicFilter)
        expect(staticFilter.length).toEqual(dynamicFilter.length)
        expect(staticFilter).not.toEqual(dynamicFilter)
        expect(staticFilter[0]).not.toEqual(dynamicFilter[0])
        expect(staticFilter[1]).toEqual(dynamicFilter[1])
        expect(staticFilter[0].arguments[1]).toEqual(period.id)

        let response = getStaticFilterFromPeriod(period, undefined)
        expect(response).toBeUndefined()

        response = getStaticFilterFromPeriod(undefined, dynamicFilter)
        expect(response).toBeUndefined()
    })
})
