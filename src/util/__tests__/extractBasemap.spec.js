import { extractBasemap } from '../extractBasemap';

const defaultBasemapId = 'osmLight';

test('extractBasemap when basemap in mapViews', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        mapViews: [
            {
                layer: 'external',
                config:
                    '{"mapLayerPosition": "BASEMAP","id": "Basemap id","name": "Basemap name"}',
            },
            {
                layer: 'thematic',
                id: 'thematic layer id',
                name: 'All the pretty colors',
                config: {
                    mapLayerPosition: 'OVERLAY',
                },
            },
        ],
    };

    expect(extractBasemap(config)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: {
                id: 'Basemap id',
                mapLayerPosition: 'BASEMAP',
                name: 'Basemap name',
            },
            mapViews: [
                {
                    layer: 'thematic',
                    id: 'thematic layer id',
                    name: 'All the pretty colors',
                    config: {
                        mapLayerPosition: 'OVERLAY',
                    },
                },
            ],
        })
    );
});

test('extractBasemap when basemap is a string but not "none"', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: defaultBasemapId,
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    };

    expect(extractBasemap(config)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: defaultBasemapId },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    );
});

test('extractBasemap when basemap is string "none"', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: 'none',
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    };

    expect(extractBasemap(config)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: {
                id: defaultBasemapId,
                isVisible: false,
            },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    );
});

test('extractBasemap when basemap is an object', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: {
            id: defaultBasemapId,
            displayName: 'Basemap name',
        },
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    };

    expect(extractBasemap(config)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: defaultBasemapId, displayName: 'Basemap name' },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    );
});

test('extractBasemap when no basemap in config', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    };

    expect(extractBasemap(config)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: defaultBasemapId },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    );
});
