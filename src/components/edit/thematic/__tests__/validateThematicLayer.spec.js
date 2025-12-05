import { validateThematicLayer } from '../validateThematicLayer.js'
const { dimConf } = require('../../../../constants/dimension.js')
const {
    CLASSIFICATION_PREDEFINED,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} = require('../../../../constants/layers.js')
const {
    MULTIMAP_MAX_PERIODS,
    MULTIMAP_MIN_PERIODS,
    START_END_DATES,
} = require('../../../../constants/periods.js')
const analytics = require('../../../../util/analytics.js')
const periodsUtil = require('../../../../util/periods.js')
const timeUtil = require('../../../../util/time.js')
const radiusModule = require('../RadiusSelect.jsx')

describe('validateThematicLayer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        analytics.getOrgUnitsFromRows = jest.fn().mockReturnValue([1])
        periodsUtil.countPeriods = jest.fn().mockReturnValue(2)
        timeUtil.getStartEndDateError = jest.fn().mockReturnValue(null)
        radiusModule.isValidRadius = jest.fn().mockReturnValue(true)
    })

    const baseArgs = {
        indicatorGroup: null,
        dataElementGroup: null,
        dataItem: null,
        program: null,
        periodType: null,
        startDate: null,
        endDate: null,
        rows: [],
        legendSet: null,
        radiusLow: null,
        radiusHigh: null,
        renderingStrategy: null,
        method: null,
        periods: [{ id: '202001' }],
    }

    it('returns errors for missing indicator group and indicator when valueType is indicator', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.indicator.objectName,
            rows: [],
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.indicatorGroupError).toBeDefined()
        expect(res.errors.indicatorError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns errors for missing data element group and data element when valueType is dataElement', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.dataElementGroupError).toBeDefined()
        expect(res.errors.dataElementError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns errors for missing data element group and data element when valueType is operand', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.operand.objectName,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.dataElementGroupError).toBeDefined()
        expect(res.errors.dataElementError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns dataSetError when valueType is dataSet and no dataItem', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.dataSet.objectName,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.dataSetError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns program and event data item errors when valueType is eventDataItem and missing program/dataItem', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.eventDataItem.objectName,
            program: null,
            dataItem: null,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.programError).toBeDefined()
        expect(res.errors.eventDataItemError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns program and program indicator errors when valueType is programIndicator and missing program/dataItem', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.programIndicator.objectName,
            program: null,
            dataItem: null,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.programError).toBeDefined()
        expect(res.errors.programIndicatorError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns calculationError when valueType is calculation and no dataItem', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.calculation.objectName,
            dataItem: null,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.calculationError).toBeDefined()
        expect(res.errors.tab).toBe('data')
    })

    it('returns periodError when periods array is empty and periodType is not START_END_DATES', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
            periods: [],
            periodType: null,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.periodError).toBeDefined()
        expect(res.errors.tab).toBe('period')
    })

    it('returns periodError when too many periods for split rendering strategy', () => {
        periodsUtil.countPeriods = jest
            .fn()
            .mockReturnValue(MULTIMAP_MAX_PERIODS + 1)

        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
            renderingStrategy: RENDERING_STRATEGY_SPLIT_BY_PERIOD,
            periods: [{}, {}],
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.periodError).toBeDefined()
        expect(res.errors.periodError).toContain(String(MULTIMAP_MAX_PERIODS))
        expect(res.errors.tab).toBe('period')
    })

    it('returns periodError when too few periods for timeline or split rendering', () => {
        periodsUtil.countPeriods = jest
            .fn()
            .mockReturnValue(MULTIMAP_MIN_PERIODS - 1)

        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            periods: [{}, {}],
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.periodError).toBeDefined()
        expect(res.errors.periodError).toContain(String(MULTIMAP_MIN_PERIODS))
        expect(res.errors.tab).toBe('period')
    })

    it('returns start/end period error when periodType is START_END_DATES and getStartEndDateError returns message', () => {
        timeUtil.getStartEndDateError = jest.fn().mockReturnValue('bad dates')

        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
            periodType: START_END_DATES,
            startDate: '2020-01-02',
            endDate: '2020-01-01',
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.periodError).toBe('bad dates')
        expect(res.errors.tab).toBe('period')
    })

    it('returns orgUnits error when no org units in rows', () => {
        analytics.getOrgUnitsFromRows = jest.fn().mockReturnValue([])

        const args = {
            ...baseArgs,

            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.orgUnitsError).toBeDefined()
        expect(res.errors.tab).toBe('orgunits')
    })

    it('returns legendSetError when method is CLASSIFICATION_PREDEFINED and no legendSet', () => {
        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,

            dataItem: { id: 'x' },
            method: CLASSIFICATION_PREDEFINED,
            legendSet: null,
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.legendSetError).toBeDefined()
        expect(res.errors.tab).toBe('style')
    })

    it('returns radiusError when radius is invalid', () => {
        radiusModule.isValidRadius = jest.fn().mockReturnValue(false)

        const args = {
            ...baseArgs,
            valueType: dimConf.dataElement.objectName,
            dataItem: { id: 'x' },
        }

        const res = validateThematicLayer(args)
        expect(res.isValid).toBe(false)
        expect(res.errors.radiusError).toBeDefined()
        expect(res.errors.tab).toBe('style')
    })
})
