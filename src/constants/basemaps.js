import i18n from '@dhis2/d2-i18n'
import { TILE_LAYER, GOOGLE_LAYER, BING_LAYER } from '../constants/layers.js'

export const FALLBACK_BASEMAP_ID = 'osmLight'

export const getFallbackBasemap = () => defaultBasemaps()[0]

export const getBasemap = (id) => defaultBasemaps().find((map) => map.id === id)

export const defaultBasemaps = () => [
    {
        id: FALLBACK_BASEMAP_ID,
        name: i18n.t('OSM Light'),
        img: 'images/osmlight.png',
        config: {
            type: TILE_LAYER,
            url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        },
    },
    {
        id: 'openStreetMap',
        name: i18n.t('OSM Detailed'),
        img: 'images/osm.png',
        config: {
            type: TILE_LAYER,
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
            type: GOOGLE_LAYER,
            style: 'ROADMAP',
        },
    },
    {
        id: 'googleHybrid',
        name: i18n.t('Google Hybrid'),
        img: 'images/googlehybrid.jpeg',
        config: {
            type: GOOGLE_LAYER,
            style: 'HYBRID',
        },
    },
    {
        id: 'bingLight',
        name: i18n.t('Bing Road'),
        img: 'images/bingroad.png',
        config: {
            type: BING_LAYER,
            style: 'CanvasLight',
            apiKey: 'AotYGLQC0RDcofHC5pWLaW7k854n-6T9mTunsev9LEFwVqGaVnG8b4KERNY9PeKA', // TODO: Read from db
        },
    },
    {
        id: 'bingDark',
        name: i18n.t('Bing Dark'),
        img: 'images/bingdark.png',
        config: {
            type: BING_LAYER,
            style: 'CanvasDark',
        },
    },
    {
        id: 'bingAerial',
        name: i18n.t('Bing Aerial'),
        img: 'images/bingaerial.jpeg',
        config: {
            type: BING_LAYER,
            style: 'Aerial',
        },
    },
    {
        id: 'bingHybrid',
        name: i18n.t('Bing Aerial Labels'),
        img: 'images/binghybrid.jpeg',
        config: {
            type: BING_LAYER,
            style: 'AerialWithLabelsOnDemand',
        },
    },
]
