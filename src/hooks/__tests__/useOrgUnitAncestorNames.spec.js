import { renderHook, waitFor } from '@testing-library/react'
import { fetchOrgUnitPathDetails } from '../../util/orgUnits.js'
import useOrgUnitAncestorNames from '../useOrgUnitAncestorNames.js'

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => mockEngine,
}))
const mockEngine = {}

jest.mock('../../util/orgUnits.js', () => ({
    fetchOrgUnitPathDetails: jest.fn(),
}))

beforeEach(() => {
    fetchOrgUnitPathDetails.mockReset()
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
            ])
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
})
