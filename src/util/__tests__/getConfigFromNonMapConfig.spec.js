import { getConfigFromNonMapConfig } from '../getConfigFromNonMapConfig';
import * as getuid from 'd2/uid';
import * as analyticalObject from '../analyticalObject';
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
};

const defaultBasemapId = 'defaultBasemapId';

test('getConfigFromNonMapConfig', async () => {
    analyticalObject.getThematicLayerFromAnalyticalObject = jest
        .fn()
        .mockResolvedValue(nonMapMapView);

    getuid.generateUid = jest.fn().mockReturnValue('abc123');

    const res = await getConfigFromNonMapConfig(
        { el: 'the element', name: 'the name' },
        defaultBasemapId
    );

    expect(res).toEqual(
        expect.objectContaining({
            el: 'the element',
            name: 'the name',
            basemap: { id: defaultBasemapId },
            mapViews: [
                {
                    id: 'abc123',
                    ...nonMapMapView,
                },
            ],
        })
    );
});
