import i18n from '@dhis2/d2-i18n'
import { TILE_LAYER, BING_LAYER, AZURE_LAYER } from '../constants/layers.js'

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
                '&copy; <a target="_blank" rel="noreferrer" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a target="_blank" rel="noreferrer" href="https://cartodb.com/attributions">CartoDB</a>',
        },
        isDark: false,
    },
    {
        id: 'openStreetMap',
        name: i18n.t('OSM Detailed'),
        img: 'images/osm.png',
        config: {
            type: TILE_LAYER,
            url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution:
                '&copy; <a target="_blank" rel="noreferrer" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
        isDark: false,
    },
    {
        id: 'sentinel2eox',
        name: i18n.t('Sentinel-2 EOX'),
        img: 'images/s2eox.png',
        config: {
            type: TILE_LAYER,
            layers: 's2cloudless-2024_3857',
            format: 'image/jpeg',
            url: '//tiles.maps.eox.at',
            attribution:
                '&copy; <a target="_blank" rel="noreferrer" href="https://s2maps.eu/">Sentinel-2 cloudless</a> by <a target="_blank" rel="noreferrer" href="https://eox.at/">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2024)',
        },
        isDark: false,
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
        isDark: false,
    },
    {
        id: 'bingDark',
        name: i18n.t('Bing Dark'),
        img: 'images/bingdark.png',
        config: {
            type: BING_LAYER,
            style: 'CanvasDark',
        },
        isDark: true,
    },
    {
        id: 'bingAerial',
        name: i18n.t('Bing Aerial'),
        img: 'images/bingaerial.jpeg',
        config: {
            type: BING_LAYER,
            style: 'Aerial',
        },
        isDark: true,
    },
    {
        id: 'bingHybrid',
        name: i18n.t('Bing Aerial Labels'),
        img: 'images/binghybrid.jpeg',
        config: {
            type: BING_LAYER,
            style: 'AerialWithLabelsOnDemand',
        },
        isDark: true,
    },
    {
        id: 'azureLight',
        name: i18n.t('Azure Road'),
        img: 'images/azureroad.png',
        config: {
            type: AZURE_LAYER,
            style: ['microsoft.base.road'],
        },
        isDark: false,
    },
    {
        id: 'azureDark',
        name: i18n.t('Azure Dark'),
        img: 'images/azuredark.png',
        config: {
            type: AZURE_LAYER,
            style: ['microsoft.base.darkgrey'],
        },
        isDark: true,
    },
    {
        id: 'azureAerial',
        name: i18n.t('Azure Aerial'),
        img: 'images/azureaerial.png',
        config: {
            type: AZURE_LAYER,
            style: ['microsoft.imagery'],
        },
        isDark: true,
    },
    {
        id: 'azureHybrid',
        name: i18n.t('Azure Aerial Labels'),
        img: 'images/azurehybrid.png',
        config: {
            type: AZURE_LAYER,
            style: ['microsoft.imagery', 'microsoft.base.hybrid.road'],
        },
        isDark: true,
    },
]
