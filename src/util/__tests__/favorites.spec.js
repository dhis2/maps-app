import { cleanMapConfig } from '../favorites'

describe('cleanMapConfig', () => {
    test('adds basemap when config basemap is missing id', () => {
        const config = {
            basemap: { isExpanded: true, isVisible: true, opacity: 0.9 },
            latitude: null,
            mapViews: [{ layer: 'layer1' }],
            name: 'my new map',
            zoom: null,
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })
        expect(cleanedConfig).toEqual(
            expect.objectContaining({
                basemap: 'thedefaultBasemap',
                mapViews: [{ layer: 'layer1' }],
                name: 'my new map',
            })
        )

        expect(cleanedConfig).toEqual(
            expect.not.objectContaining({
                zoom: null,
                latitude: null,
            })
        )
    })

    test('returns basemap id from config', () => {
        const config = {
            basemap: {
                id: 'myUniqueBasemap',
                isExpanded: true,
                isVisible: true,
                opacity: 0.9,
            },
            mapViews: [{ layer: 'layer1' }],
            name: 'my new map',
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })
        expect(cleanedConfig).toEqual(
            expect.objectContaining({
                basemap: 'myUniqueBasemap',
                mapViews: [{ layer: 'layer1' }],
                name: 'my new map',
            })
        )
    })
})
