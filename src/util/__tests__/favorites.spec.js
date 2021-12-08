import { cleanMapConfig } from '../favorites';

const defaultBasemap = { id: 'theDefaultBasemap' };

test('cleanMapConfig returns the basemap from the map config', () => {
    const config = {
        id: 'kermit',
        latitude: '135',
        mapViews: [],
        name: 'Kermit',
        basemap: { id: 'sesameStreet' },
    };

    expect(cleanMapConfig({ config, defaultBasemap })).toMatchObject({
        id: 'kermit',
        latitude: '135',
        name: 'Kermit',
        mapViews: [],
        basemap: 'sesameStreet',
    });
});

test('cleanMapConfig returns default basemap from system', () => {
    const config = {
        id: 'kermit',
        latitude: '135',
        mapViews: [],
        name: 'Kermit',
    };

    expect(cleanMapConfig({ config, defaultBasemap })).toMatchObject({
        id: 'kermit',
        latitude: '135',
        name: 'Kermit',
        mapViews: [],
        basemap: 'theDefaultBasemap',
    });
});

test('cleanMapConfig returns "none" for basemap if not visible', () => {
    const config = {
        id: 'kermit',
        latitude: '135',
        name: 'Kermit',
        mapViews: [],
        basemap: {
            id: 'sesameStreet',
            isVisible: false,
        },
    };

    expect(cleanMapConfig({ config, defaultBasemap })).toMatchObject({
        id: 'kermit',
        latitude: '135',
        name: 'Kermit',
        mapViews: [],
        basemap: 'none',
    });
});

test('cleanMapConfig returns "osmLight" for basemap if no basemap defined', () => {
    const config = {
        id: 'kermit',
        latitude: '135',
        mapViews: [],
        name: 'Kermit',
    };

    expect(cleanMapConfig({ config, defaultBasemap: null })).toMatchObject({
        id: 'kermit',
        latitude: '135',
        name: 'Kermit',
        mapViews: [],
        basemap: 'osmLight',
    });
});
