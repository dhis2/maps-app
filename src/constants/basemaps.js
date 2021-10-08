import i18n from '@dhis2/d2-i18n';

export const defaultBasemaps = () => [
    {
        id: 'osmStreetView',
        name: i18n.t('OSM Streetview'),
        img: 'images/vector-basemap2.png',
        config: {
            type: 'vectorStyle',
            url: '//basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            beforeId: 'watername_ocean',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        },
    },
    {
        id: 'osmLight',
        name: i18n.t('OSM Light'),
        img: 'images/osmlight.png',
        config: {
            type: 'vectorStyle',
            url: '//basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            beforeId: 'watername_ocean',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        },
    },
    {
        id: 'openStreetMap',
        name: i18n.t('OSM Detailed'),
        img: 'images/osm.png',
        config: {
            type: 'tileLayer',
            url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
    },
    {
        id: 'googleStreets',
        name: i18n.t('Google Streets'),
        img: 'images/googlestreets.png',
        config: {
            type: 'googleLayer',
            style: 'ROADMAP',
        },
    },
    {
        id: 'googleHybrid',
        name: i18n.t('Google Hybrid'),
        img: 'images/googlehybrid.jpeg',
        config: {
            type: 'googleLayer',
            style: 'HYBRID',
        },
    },
    {
        id: 'bingLight',
        name: i18n.t('Bing Road'),
        img: 'images/bingroad.png',
        config: {
            type: 'bingLayer',
            style: 'CanvasLight',
            apiKey:
                'AotYGLQC0RDcofHC5pWLaW7k854n-6T9mTunsev9LEFwVqGaVnG8b4KERNY9PeKA', // TODO: Read from db
        },
    },
    {
        id: 'bingDark',
        name: i18n.t('Bing Dark'),
        img: 'images/bingdark.png',
        config: {
            type: 'bingLayer',
            style: 'CanvasDark',
        },
    },
    {
        id: 'bingAerial',
        name: i18n.t('Bing Aerial'),
        img: 'images/bingaerial.jpeg',
        config: {
            type: 'bingLayer',
            style: 'Aerial',
        },
    },
    {
        id: 'bingHybrid',
        name: i18n.t('Bing Aerial Labels'),
        img: 'images/binghybrid.jpeg',
        config: {
            type: 'bingLayer',
            style: 'AerialWithLabelsOnDemand',
        },
    },
];
