import { getValuesByPeriod, getValueMapsById } from '../thematicLoader.js'

const headers = [{ name: 'pe' }, { name: 'ou' }, { name: 'value' }]

describe('thematicLoader value extraction', () => {
    // Analytics returns row values as strings, and computed items (indicators,
    // calculations) serialize whole numbers with a trailing ".0" (e.g. "16082.0").
    // Both extractors must yield numbers so integers render without decimals.
    // See DHIS2-21037.

    test('getValueMapsById coerces string values to numbers', () => {
        const data = {
            headers,
            rows: [
                ['202501', 'ou1', '16082.0'],
                ['202501', 'ou2', '118.13'],
            ],
        }

        expect(getValueMapsById(data).valueById).toEqual({
            ou1: 16082,
            ou2: 118.13,
        })
    })

    test('getValuesByPeriod coerces string values to numbers per period', () => {
        const data = {
            headers,
            rows: [
                ['202501', 'ou1', '16082.0'],
                ['202501', 'ou2', '118.13'],
                ['202502', 'ou1', '238.0'],
            ],
        }

        expect(getValuesByPeriod(data)).toEqual({
            202501: {
                ou1: { value: 16082 },
                ou2: { value: 118.13 },
            },
            202502: {
                ou1: { value: 238 },
            },
        })
    })

    test('getValuesByPeriod and getValueMapsById agree on the same value', () => {
        const data = {
            headers,
            rows: [['202501', 'ou1', '238.0']],
        }

        const { valueById } = getValueMapsById(data)
        const byPeriod = getValuesByPeriod(data)

        expect(byPeriod['202501'].ou1.value).toBe(valueById.ou1)
    })
})
