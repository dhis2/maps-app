import { getAnalyticsRequest } from '../event.js'

const mockRequestInstance = {
    withProgram: jest.fn().mockReturnThis(),
    withStage: jest.fn().mockReturnThis(),
    withCoordinatesOnly: jest.fn().mockReturnThis(),
    addPeriodFilter: jest.fn().mockReturnThis(),
    withStartDate: jest.fn().mockReturnThis(),
    withEndDate: jest.fn().mockReturnThis(),
    withRelativePeriodDate: jest.fn().mockReturnThis(),
    addOrgUnitDimension: jest.fn().mockReturnThis(),
    addDimension: jest.fn().mockReturnThis(),
    withCoordinateField: jest.fn().mockReturnThis(),
    withEventStatus: jest.fn().mockReturnThis(),
    withParameters: jest.fn().mockReturnThis(),
}

const MockRequestConstructor = jest.fn(() => mockRequestInstance)
const mockAnalyticsEngine = { request: MockRequestConstructor }

const baseLayer = {
    program: { id: 'programId' },
    programStage: { id: 'stageId' },
    filters: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    rows: [{ dimension: 'ou', items: [{ id: 'ou1' }] }],
    columns: [],
    styleDataItem: null,
}

const baseContext = {
    nameProperty: 'name',
    engine: {},
    analyticsEngine: mockAnalyticsEngine,
}

const getDimensionCalls = (dimension) =>
    mockRequestInstance.addDimension.mock.calls.filter(
        ([dim]) => dim === dimension
    )

describe('getAnalyticsRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('combines multiple filters on the same dimension with colon separator', async () => {
        const layer = {
            ...baseLayer,
            columns: [
                { dimension: 'qrur9Dvnyt5', name: 'Age', filter: 'GT:50' },
                { dimension: 'qrur9Dvnyt5', name: 'Age', filter: 'LT:60' },
            ],
        }

        await getAnalyticsRequest(layer, baseContext)

        const calls = getDimensionCalls('qrur9Dvnyt5')
        expect(calls).toHaveLength(1)
        expect(calls[0][1]).toBe('GT:50:LT:60')
    })

    it('passes a single filter unchanged', async () => {
        const layer = {
            ...baseLayer,
            columns: [
                { dimension: 'qrur9Dvnyt5', name: 'Age', filter: 'GT:50' },
            ],
        }

        await getAnalyticsRequest(layer, baseContext)

        const calls = getDimensionCalls('qrur9Dvnyt5')
        expect(calls).toHaveLength(1)
        expect(calls[0][1]).toBe('GT:50')
    })

    it('keeps filters on different dimensions separate', async () => {
        const layer = {
            ...baseLayer,
            columns: [
                { dimension: 'qrur9Dvnyt5', name: 'Age', filter: 'GT:50' },
                { dimension: 'fakeDataElId', name: 'Weight', filter: 'LT:80' },
            ],
        }

        await getAnalyticsRequest(layer, baseContext)

        expect(getDimensionCalls('qrur9Dvnyt5')).toHaveLength(1)
        expect(getDimensionCalls('qrur9Dvnyt5')[0][1]).toBe('GT:50')
        expect(getDimensionCalls('fakeDataElId')).toHaveLength(1)
        expect(getDimensionCalls('fakeDataElId')[0][1]).toBe('LT:80')
    })

    it('falls back to start/end dates when no period is selected', async () => {
        await getAnalyticsRequest(baseLayer, baseContext)

        expect(mockRequestInstance.withStartDate).toHaveBeenCalledWith(
            '2023-01-01'
        )
        expect(mockRequestInstance.withEndDate).toHaveBeenCalledWith(
            '2023-12-31'
        )
        expect(mockRequestInstance.addPeriodFilter).not.toHaveBeenCalled()
    })

    it('adds a period filter with a single selected period', async () => {
        const layer = {
            ...baseLayer,
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
        }

        await getAnalyticsRequest(layer, baseContext)

        expect(mockRequestInstance.addPeriodFilter).toHaveBeenCalledWith([
            'LAST_12_MONTHS',
        ])
        expect(mockRequestInstance.withStartDate).not.toHaveBeenCalled()
        expect(mockRequestInstance.withEndDate).not.toHaveBeenCalled()
    })

    it('adds a period filter with multiple selected periods', async () => {
        const layer = {
            ...baseLayer,
            filters: [
                {
                    dimension: 'pe',
                    items: [{ id: '2023Q1' }, { id: '2023Q2' }],
                },
            ],
        }

        await getAnalyticsRequest(layer, baseContext)

        expect(mockRequestInstance.addPeriodFilter).toHaveBeenCalledWith([
            '2023Q1',
            '2023Q2',
        ])
    })
})
