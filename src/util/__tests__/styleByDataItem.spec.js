import { EVENT_COLOR, EVENT_RADIUS } from '../../constants/layers.js'
import {
    numberValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes.js'
import { styleByDataItem } from '../styleByDataItem.js'

jest.mock('@dhis2/d2-i18n', () => ({
    t: jest.fn((str) => str),
    addResources: jest.fn(),
}))

const STYLE_DATA_ITEM_ID = 'styleDataItemId'
const STYLE_DATA_ITEM_NAME = 'styleDataItemName'
const OPTION_SET_ID = 'optionSetId'
const OPTION_SET_NAME = 'optionSetName'
const LEGEND_SET_ID = 'legendSetId'
const LEGEND_SET_NAME = 'legendSetName'
const NOTSET_VALUE = 'Not set'
const SOME_VALUE = 'some value'

describe('styleByDataItem', () => {
    let mockEngine

    beforeEach(() => {
        mockEngine = {
            query: jest.fn((query, extra) => {
                if (extra.variables?.id === STYLE_DATA_ITEM_ID) {
                    return Promise.resolve({
                        dataElement: { name: STYLE_DATA_ITEM_NAME },
                    })
                }
                if (extra.variables?.id === LEGEND_SET_ID) {
                    return Promise.resolve({
                        legendSet: {
                            id: LEGEND_SET_ID,
                            name: LEGEND_SET_NAME,
                            legends: [
                                {
                                    startValue: 2,
                                    endValue: 3,
                                    color: 'red',
                                    id: 'id_high',
                                    name: 'High',
                                },
                                {
                                    startValue: 1,
                                    endValue: 2,
                                    color: 'yellow',
                                    id: 'id_medium',
                                    name: 'Medium',
                                },
                                {
                                    startValue: 0,
                                    endValue: 1,
                                    color: 'green',
                                    id: 'id_low',
                                    name: 'Low',
                                },
                            ],
                        },
                    })
                }
                if (extra.variables?.id === OPTION_SET_ID) {
                    return Promise.resolve({
                        optionSet: {
                            name: OPTION_SET_NAME,
                            options: [
                                {
                                    id: '1',
                                    name: 'Option 1',
                                    style: { color: 'green' },
                                },
                                {
                                    id: '2',
                                    name: 'Option 2',
                                    style: { color: 'yellow' },
                                },
                            ],
                        },
                    })
                }
                return Promise.resolve({})
            }),
        }
    })

    it('should apply default styling when no specific type is matched', async () => {
        const config = {
            styleDataItem: { id: STYLE_DATA_ITEM_ID, valueType: 'TEXT' },
            data: [
                { properties: { [STYLE_DATA_ITEM_ID]: SOME_VALUE } },
                { properties: {} },
            ],
            legend: { items: [] },
        }

        const result = await styleByDataItem(config, mockEngine)

        expect(result.data[0].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[1].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })

        expect(result.legend.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: NOTSET_VALUE,
                    color: EVENT_COLOR,
                    radius: EVENT_RADIUS,
                    count: 2,
                }),
            ])
        )
    })

    it('should apply numeric styling when valueType is a number - classification predefined', async () => {
        const config = {
            styleDataItem: {
                id: STYLE_DATA_ITEM_ID,
                valueType: numberValueTypes[3],
            },
            data: [
                { properties: { [STYLE_DATA_ITEM_ID]: 0.5 } },
                { properties: { [STYLE_DATA_ITEM_ID]: 1.5 } },
                { properties: { [STYLE_DATA_ITEM_ID]: 2.5 } },
                { properties: { [STYLE_DATA_ITEM_ID]: 3.5 } },
                { properties: {} },
                { properties: { [STYLE_DATA_ITEM_ID]: SOME_VALUE } },
            ],
            method: 1,
            legendSet: { id: LEGEND_SET_ID },
            eventPointRadius: 5,
            legend: { items: [] },
        }

        const result = await styleByDataItem(config, mockEngine)

        expect(mockEngine.query).toHaveBeenCalled()

        expect(result.data[0].properties).toMatchObject({
            value: 0.5,
            color: 'green',
        })
        expect(result.data[1].properties).toMatchObject({
            value: 1.5,
            color: 'yellow',
        })
        expect(result.data[2].properties).toMatchObject({
            value: 2.5,
            color: 'red',
        })
        expect(result.data[3].properties).toMatchObject({
            value: 3.5,
            color: EVENT_COLOR,
        })
        expect(result.data[4].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[5].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })

        expect(result.legend.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Low',
                    startValue: 0,
                    endValue: 1,
                    color: 'green',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    name: 'Medium',
                    startValue: 1,
                    endValue: 2,
                    color: 'yellow',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    name: 'High',
                    startValue: 2,
                    endValue: 3,
                    color: 'red',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    name: NOTSET_VALUE,
                    color: EVENT_COLOR,
                    radius: 5,
                    count: 3,
                }),
            ])
        )
        expect(result.legend.unit).toEqual(LEGEND_SET_NAME)
    })

    it('should apply numeric styling when valueType is a number - classification auto', async () => {
        const config = {
            styleDataItem: {
                id: STYLE_DATA_ITEM_ID,
                valueType: numberValueTypes[3],
            },
            data: [
                { properties: { [STYLE_DATA_ITEM_ID]: 0 } },
                { properties: { [STYLE_DATA_ITEM_ID]: 1 } },
                { properties: { [STYLE_DATA_ITEM_ID]: 2 } },
                { properties: {} },
                { properties: { [STYLE_DATA_ITEM_ID]: SOME_VALUE } },
            ],
            method: 2,
            classes: 3,
            colorScale: ['#ff0000', '#00ff00', '#0000ff'],
            eventPointRadius: 5,
            legend: { items: [] },
        }

        const result = await styleByDataItem(config, mockEngine)

        expect(mockEngine.query).toHaveBeenCalled()

        expect(result.data[0].properties).toMatchObject({
            value: 0,
            color: '#ff0000',
        })
        expect(result.data[1].properties).toMatchObject({
            value: 1,
            color: '#00ff00',
        })
        expect(result.data[2].properties).toMatchObject({
            value: 2,
            color: '#0000ff',
        })
        expect(result.data[3].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[4].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })

        expect(result.legend.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    startValue: 0,
                    endValue: 0.67,
                    color: '#ff0000',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    startValue: 0.67,
                    endValue: 1.33,
                    color: '#00ff00',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    startValue: 1.33,
                    endValue: 2,
                    color: '#0000ff',
                    radius: 5,
                    count: 1,
                }),
                expect.objectContaining({
                    name: NOTSET_VALUE,
                    color: EVENT_COLOR,
                    radius: 5,
                    count: 2,
                }),
            ])
        )
        expect(result.legend.unit).toEqual(STYLE_DATA_ITEM_NAME)
    })

    it('should apply boolean styling correctly', async () => {
        const config = {
            styleDataItem: {
                id: STYLE_DATA_ITEM_ID,
                valueType: booleanValueTypes[0],
                values: { true: 'red', false: 'blue' },
            },
            data: [
                { properties: { [STYLE_DATA_ITEM_ID]: '1' } },
                { properties: { [STYLE_DATA_ITEM_ID]: '0' } },
                { properties: {} },
                { properties: { [STYLE_DATA_ITEM_ID]: SOME_VALUE } },
            ],
            legend: { items: [] },
            eventPointRadius: 10,
        }

        const result = await styleByDataItem(config, mockEngine)

        expect(mockEngine.query).toHaveBeenCalled()

        expect(result.data[0].properties).toMatchObject({
            value: 'Yes',
            color: 'red',
        })
        expect(result.data[1].properties).toMatchObject({
            value: 'No',
            color: 'blue',
        })
        expect(result.data[2].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[3].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })

        expect(result.legend.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Yes',
                    color: 'red',
                    radius: 10,
                    count: 1,
                }),
                expect.objectContaining({
                    name: 'No',
                    color: 'blue',
                    radius: 10,
                    count: 1,
                }),
                expect.objectContaining({
                    name: NOTSET_VALUE,
                    color: EVENT_COLOR,
                    radius: 10,
                    count: 2,
                }),
            ])
        )
        expect(result.legend.unit).toEqual(STYLE_DATA_ITEM_NAME)
    })

    it('should handle option set styling correctly', async () => {
        const config = {
            styleDataItem: {
                id: STYLE_DATA_ITEM_ID,
                optionSet: {
                    id: OPTION_SET_ID,
                    options: [{ id: '1' }, { id: '2' }],
                },
            },
            data: [
                { properties: { [STYLE_DATA_ITEM_ID]: 'Option 1' } },
                { properties: { [STYLE_DATA_ITEM_ID]: 'Option 2' } },
                { properties: {} },
                { properties: { [STYLE_DATA_ITEM_ID]: SOME_VALUE } },
            ],
            legend: { items: [] },
            eventPointRadius: 8,
        }

        const result = await styleByDataItem(config, mockEngine)

        expect(mockEngine.query).toHaveBeenCalled()

        expect(result.data[0].properties).toMatchObject({
            value: 'Option 1',
            color: 'green',
        })
        expect(result.data[1].properties).toMatchObject({
            value: 'Option 2',
            color: 'yellow',
        })
        expect(result.data[2].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[3].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[2].properties).toMatchObject({
            value: NOTSET_VALUE,
            color: EVENT_COLOR,
        })
        expect(result.data[3].properties).toMatchObject({
            value: SOME_VALUE,
            color: EVENT_COLOR,
        })

        expect(result.legend.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Option 1',
                    color: 'green',
                    radius: 8,
                    count: 1,
                }),
                expect.objectContaining({
                    name: 'Option 2',
                    color: 'yellow',
                    radius: 8,
                    count: 1,
                }),
                expect.objectContaining({
                    name: NOTSET_VALUE,
                    color: '#333333',
                    radius: 8,
                }),
            ])
        )
        expect(result.legend.unit).toEqual(OPTION_SET_NAME)
    })
})
