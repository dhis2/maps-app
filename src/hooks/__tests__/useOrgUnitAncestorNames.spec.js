import { renderHook, waitFor } from '@testing-library/react'
import { fetchOrgUnitPathDetails } from '../../util/orgUnits.js'
import useOrgUnitAncestorNames, {
    __resetOrgUnitNameSessionCacheForTests,
} from '../useOrgUnitAncestorNames.js'

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => mockEngine,
}))
const mockEngine = {}

jest.mock('../../components/cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({ nameProperty: 'displayShortName' }),
}))

jest.mock('../../util/orgUnits.js', () => ({
    fetchOrgUnitPathDetails: jest.fn(),
}))

beforeEach(() => {
    fetchOrgUnitPathDetails.mockReset()
    __resetOrgUnitNameSessionCacheForTests()
})

describe('useOrgUnitAncestorNames', () => {
    it('does not fetch when there are no path values', () => {
        renderHook(() => useOrgUnitAncestorNames([]))
        expect(fetchOrgUnitPathDetails).not.toHaveBeenCalled()
    })

    it('fetches once with the distinct ancestor ids extracted from every path value', async () => {
        fetchOrgUnitPathDetails.mockResolvedValue({})
        renderHook(() =>
            useOrgUnitAncestorNames([
                '/country1/region1/facility1',
                '/country1/region2/facility2',
            ])
        )
        await waitFor(() => {
            expect(fetchOrgUnitPathDetails).toHaveBeenCalledTimes(1)
        })
        expect(fetchOrgUnitPathDetails).toHaveBeenCalledWith(
            {},
            expect.arrayContaining([
                'country1',
                'region1',
                'facility1',
                'region2',
                'facility2',
            ]),
            'displayShortName'
        )
    })

    it('transitions from loading to a resolved idToName map', async () => {
        fetchOrgUnitPathDetails.mockResolvedValue({
            country1: { name: 'Sierra Leone', level: 1 },
        })
        const { result } = renderHook(() =>
            useOrgUnitAncestorNames(['/country1'])
        )
        expect(result.current.loading).toBe(true)

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })
        expect(result.current.idToName.get('country1')).toBe('Sierra Leone')
    })

    it('does not fetch ids that are present in the seed map, and returns them merged into idToName immediately', async () => {
        fetchOrgUnitPathDetails.mockResolvedValue({
            region1: { name: 'Region 1', level: 2 },
            facility1: { name: 'Facility 1', level: 3 },
        })
        const knownIdToName = new Map([['country1', 'Sierra Leone']])
        const { result } = renderHook(() =>
            useOrgUnitAncestorNames(
                ['/country1/region1/facility1'],
                knownIdToName
            )
        )

        expect(fetchOrgUnitPathDetails).toHaveBeenCalledWith(
            {},
            expect.arrayContaining(['region1', 'facility1']),
            'displayShortName'
        )
        const [, fetchedIds] = fetchOrgUnitPathDetails.mock.calls[0]
        expect(fetchedIds).not.toContain('country1')

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })
        expect(result.current.idToName.get('country1')).toBe('Sierra Leone')
        expect(result.current.idToName.get('region1')).toBe('Region 1')
    })

    it('skips the fetch entirely when every id is already known', () => {
        const knownIdToName = new Map([['country1', 'Sierra Leone']])
        const { result } = renderHook(() =>
            useOrgUnitAncestorNames(['/country1'], knownIdToName)
        )

        expect(fetchOrgUnitPathDetails).not.toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
        expect(result.current.idToName.get('country1')).toBe('Sierra Leone')
    })

    it('reuses a name across separate hook mounts, from the session cache', async () => {
        fetchOrgUnitPathDetails.mockResolvedValue({
            country1: { name: 'Sierra Leone', level: 1 },
        })

        const first = renderHook(() => useOrgUnitAncestorNames(['/country1']))
        await waitFor(() => {
            expect(first.result.current.loading).toBe(false)
        })
        first.unmount()

        const second = renderHook(() => useOrgUnitAncestorNames(['/country1']))
        await waitFor(() => {
            expect(second.result.current.idToName.get('country1')).toBe(
                'Sierra Leone'
            )
        })

        expect(fetchOrgUnitPathDetails).toHaveBeenCalledTimes(1)
    })
})
