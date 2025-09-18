import { getConfigFromNonMapConfig } from '../getConfigFromNonMapConfig.js'
// import * as analyticalObject from '../analyticalObject';
import * as legend from '../legend.js'
import * as getuid from '../uid.js'

const mockLegendSet = { id: 'fqs276KXCXi', name: 'ANC Coverage' }
const chartConfig = {
    lastUpdated: '2018-12-03T12:51:29.620',
    href: 'http://localhost:8080/api/38/visualizations/DeRrc1gTMjn',
    created: '2018-03-06T14:09:07.510',
    name: 'ANC: ANC 3 coverage by districts last 12 months',
    showData: false,
    fixRowHeaders: false,
    type: 'COLUMN',
    hideEmptyColumns: false,
    hideEmptyRows: false,
    subscribed: false,
    parentGraphMap: {
        TEQlaapDQoK: 'ImspTQPwCqd',
        Vth0fbpFcsO: 'ImspTQPwCqd',
        bL4ooGhyHRQ: 'ImspTQPwCqd',
        jmIPBj66vD6: 'ImspTQPwCqd',
        qhqAxPSTUXp: 'ImspTQPwCqd',
    },
    rowSubTotals: false,
    displayDensity: 'NORMAL',
    regressionType: 'NONE',
    completedOnly: false,
    cumulativeValues: false,
    colTotals: false,
    showDimensionLabels: false,
    sortOrder: 0,
    fontSize: 'NORMAL',
    favorite: false,
    topLimit: 0,
    hideEmptyRowItems: 'NONE',
    aggregationType: 'DEFAULT',
    displayName: 'ANC: ANC 3 coverage by districts last 12 months',
    hideSubtitle: false,
    fixColumnHeaders: false,
    percentStackedValues: false,
    colSubTotals: false,
    noSpaceBetweenColumns: false,
    showHierarchy: false,
    rowTotals: false,
    digitGroupSeparator: 'SPACE',
    hideTitle: false,
    regression: false,
    skipRounding: false,
    legend: { showKey: false },
    lastUpdatedBy: {
        displayName: 'John Traore',
        name: 'John Traore',
        id: 'xE7jOejl9FI',
        username: 'admin',
    },
    access: {
        read: true,
        update: true,
        externalize: true,
        delete: true,
        write: true,
        manage: true,
    },
    seriesKey: { hidden: false },
    reportingParams: {
        parentOrganisationUnit: false,
        reportingPeriod: false,
        organisationUnit: false,
        grandParentOrganisationUnit: false,
    },
    user: { displayName: 'John Traore', name: 'John Traore' },
    translations: [],
    yearlySeries: [],
    interpretations: [
        { created: '2021-04-29T16:08:57.322', id: 'sKom2UDKRay' },
    ],
    subscribers: [],
    favorites: [],
    columns: [
        {
            dimension: 'ou',
            items: [
                {
                    name: 'Port Loko',
                    id: 'TEQlaapDQoK',
                    displayName: 'Port Loko',
                    displayShortName: 'Port Loko',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Kono',
                    id: 'Vth0fbpFcsO',
                    displayName: 'Kono',
                    displayShortName: 'Kono',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Pujehun',
                    id: 'bL4ooGhyHRQ',
                    displayName: 'Pujehun',
                    displayShortName: 'Pujehun',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Moyamba',
                    id: 'jmIPBj66vD6',
                    displayName: 'Moyamba',
                    displayShortName: 'Moyamba',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Koinadugu',
                    id: 'qhqAxPSTUXp',
                    displayName: 'Koinadugu',
                    displayShortName: 'Koinadugu',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                { name: 'LEVEL-2', id: 'LEVEL-2', displayName: 'LEVEL-2' },
            ],
        },
    ],
    filters: [
        {
            dimension: 'dx',
            items: [
                {
                    name: 'ANC 3 Coverage',
                    id: 'sB79w2hiLp8',
                    displayName: 'ANC 3 Coverage',
                    displayShortName: 'ANC 3 Coverage',
                    dimensionItemType: 'INDICATOR',
                },
            ],
        },
    ],
    rows: [
        {
            dimension: 'pe',
            items: [
                {
                    name: 'LAST_12_MONTHS',
                    id: 'LAST_12_MONTHS',
                    displayName: 'LAST_12_MONTHS',
                    displayShortName: 'LAST_12_MONTHS',
                    dimensionItemType: 'PERIOD',
                },
            ],
        },
    ],
}

const nonMapMapView = {
    layer: 'thematic',
    columns: [
        {
            dimension: 'dx',
            items: [
                {
                    name: 'ANC 3 Coverage',
                    id: 'sB79w2hiLp8',
                    displayName: 'ANC 3 Coverage',
                    displayShortName: 'ANC 3 Coverage',
                    dimensionItemType: 'INDICATOR',
                },
            ],
        },
    ],
    rows: [
        {
            dimension: 'ou',
            items: [
                {
                    name: 'Port Loko',
                    id: 'TEQlaapDQoK',
                    displayName: 'Port Loko',
                    displayShortName: 'Port Loko',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Kono',
                    id: 'Vth0fbpFcsO',
                    displayName: 'Kono',
                    displayShortName: 'Kono',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Pujehun',
                    id: 'bL4ooGhyHRQ',
                    displayName: 'Pujehun',
                    displayShortName: 'Pujehun',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Moyamba',
                    id: 'jmIPBj66vD6',
                    displayName: 'Moyamba',
                    displayShortName: 'Moyamba',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'Koinadugu',
                    id: 'qhqAxPSTUXp',
                    displayName: 'Koinadugu',
                    displayShortName: 'Koinadugu',
                    dimensionItemType: 'ORGANISATION_UNIT',
                },
                {
                    name: 'LEVEL-2',
                    id: 'LEVEL-2',
                    displayName: 'LEVEL-2',
                },
            ],
        },
    ],
    filters: [
        {
            dimension: 'pe',
            items: [
                {
                    name: 'LAST_12_MONTHS',
                    id: 'LAST_12_MONTHS',
                    displayName: 'LAST_12_MONTHS',
                    displayShortName: 'LAST_12_MONTHS',
                    dimensionItemType: 'PERIOD',
                },
            ],
        },
    ],
    aggregationType: 'DEFAULT',
    legendSet: {
        id: 'fqs276KXCXi',
        name: 'ANC Coverage',
    },
    isVisible: true,
    opacity: 0.9,
}

const defaultBasemapId = 'defaultBasemapId'

test('getConfigFromNonMapConfig', async () => {
    /* eslint-disable no-import-assign, import/namespace */
    legend.loadDataItemLegendSet = jest.fn().mockResolvedValue(mockLegendSet)
    getuid.generateUid = jest.fn().mockReturnValue('abc123')
    /* eslint-enable no-import-assign, import/namespace */

    const res = await getConfigFromNonMapConfig(chartConfig, defaultBasemapId)

    expect(res).toEqual(
        expect.objectContaining({
            name: chartConfig.displayName,
            basemap: { id: defaultBasemapId },
            mapViews: [
                {
                    id: 'abc123',
                    ...nonMapMapView,
                },
            ],
        })
    )
})
