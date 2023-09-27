import { getMigratedMapConfig } from '../getMigratedMapConfig.js'

const defaultBasemapId = 'defaultBasemapId'

test('getMigratedMapConfig when basemap in mapViews', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        mapViews: [
            {
                layer: 'external',
                config: '{"mapLayerPosition": "BASEMAP","id": "Basemap id","name": "Basemap name"}',
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
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
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
    )
})

test('getMigratedMapConfig when basemap is a string but not "none"', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: 'TheRainbowBasemap',
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: 'TheRainbowBasemap' },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    )
})

test('getMigratedMapConfig when basemap is string "none"', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: 'none',
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
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
    )
})

test('getMigratedMapConfig when basemap is an object', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: {
            id: 'osmStreet',
            displayName: 'Basemap name',
        },
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: 'osmStreet', displayName: 'Basemap name' },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    )
})

test('getMigratedMapConfig when no basemap in config', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        mapViews: [
            { layer: 'thematic', name: 'All the pretty colors' },
            { layer: 'facilities', name: 'All the facilities' },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: defaultBasemapId },
            mapViews: [
                { layer: 'thematic', name: 'All the pretty colors' },
                { layer: 'facilities', name: 'All the facilities' },
            ],
        })
    )
})

// TODO - add a test that checks externalLayer and basemap
test('getMigratedMapConfig with old GIS app format and Boundary layer', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: { id: 'osmStreet' },
        mapViews: [
            { layer: 'thematic1', name: 'Thematic layer 1' },
            { layer: 'thematic2', name: 'Thematic layer 2' },
            { layer: 'boundary', name: 'Boundary layer' },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: 'osmStreet' },
            mapViews: [
                { layer: 'thematic', name: 'Thematic layer 2' },
                { layer: 'thematic', name: 'Thematic layer 1' },
                { layer: 'orgUnit', name: 'Boundary layer' },
            ],
        })
    )
})

test('getMigratedMapConfig with colorScale converted to an array', () => {
    const config = {
        id: 'mapId',
        name: 'map name',
        basemap: { id: 'osmStreet' },
        mapViews: [
            {
                layer: 'thematic',
                name: 'Thematic layer',
                colorScale: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15',
            },
        ],
    }

    expect(getMigratedMapConfig(config, defaultBasemapId)).toEqual(
        expect.objectContaining({
            id: 'mapId',
            name: 'map name',
            basemap: { id: 'osmStreet' },
            mapViews: [
                {
                    layer: 'thematic',
                    name: 'Thematic layer',
                    colorScale: [
                        '#fee5d9',
                        '#fcbba1',
                        '#fc9272',
                        '#fb6a4a',
                        '#de2d26',
                        '#a50f15',
                    ],
                },
            ],
        })
    )
})
