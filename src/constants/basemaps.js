import i18n from '@dhis2/d2-i18n';

export const BASEMAP_TYPE_VECTOR_STYLE = 'vectorStyle';
export const BASEMAP_TYPE_TILE_LAYER = 'tileLayer';
export const BASEMAP_TYPE_GOOGLE_LAYER = 'googleLayer';
export const BASEMAP_TYPE_BING_LAYER = 'bingLayer';

export const defaultBasemaps = () => [
    {
        id: 'osmLight',
        name: i18n.t('OSM Light'),
        img: 'images/osmlight.png',
        config: {
            type: BASEMAP_TYPE_VECTOR_STYLE,
            url: '//basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            // beforeId: 'watername_ocean', //TODO - this may become a configurable property
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        },
    },
    {
        id: 'openStreetMap',
        name: i18n.t('OSM Detailed'),
        img: 'images/osm.png',
        config: {
            type: BASEMAP_TYPE_TILE_LAYER,
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
            type: BASEMAP_TYPE_GOOGLE_LAYER,
            style: 'ROADMAP',
        },
    },
    {
        id: 'googleHybrid',
        name: i18n.t('Google Hybrid'),
        img: 'images/googlehybrid.jpeg',
        config: {
            type: BASEMAP_TYPE_GOOGLE_LAYER,
            style: 'HYBRID',
        },
    },
    {
        id: 'bingLight',
        name: i18n.t('Bing Road'),
        img: 'images/bingroad.png',
        config: {
            type: BASEMAP_TYPE_BING_LAYER,
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
            type: BASEMAP_TYPE_BING_LAYER,
            style: 'CanvasDark',
        },
    },
    {
        id: 'bingAerial',
        name: i18n.t('Bing Aerial'),
        img: 'images/bingaerial.jpeg',
        config: {
            type: BASEMAP_TYPE_BING_LAYER,
            style: 'Aerial',
        },
    },
    {
        id: 'bingHybrid',
        name: i18n.t('Bing Aerial Labels'),
        img: 'images/binghybrid.jpeg',
        config: {
            type: BASEMAP_TYPE_BING_LAYER,
            style: 'AerialWithLabelsOnDemand',
        },
    },
];
