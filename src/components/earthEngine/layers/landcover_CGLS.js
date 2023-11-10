import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'COPERNICUS/Landcover/100m/Proba-V-C3/Global',
    img: 'images/landcover-copernicus.jpeg',
    datasetId: 'COPERNICUS/Landcover/100m/Proba-V-C3/Global',
    name: i18n.t('Landcover Copernicus'),
    description: i18n.t('Distinct landcover types collected from satellites.'),
    source: 'Copernicus / Google Earth Engine',
    periodType: 'YEARLY',
    band: 'discrete_classification',
    defaultAggregations: 'percentage',
    popup: '{name}: {value}', // In use?
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    style: [
        {
            value: 0,
            name: i18n.t('Unknown'),
            color: '#282828',
        },
        {
            value: 20,
            name: i18n.t('Shrubs'),
            color: '#ffbb22',
        },
        {
            value: 30,
            name: i18n.t('Herbaceous vegetation'),
            color: '#ffff4c',
        },
        {
            value: 40,
            name: i18n.t('Agriculture'),
            color: '#f096ff',
        },
        {
            value: 50,
            name: i18n.t('Urban / built up'),
            color: '#fa0000',
        },
        {
            value: 60,
            name: i18n.t('Bare / sparse vegetation'),
            color: '#b4b4b4',
        },
        {
            value: 70,
            name: i18n.t('Snow and ice'),
            color: '#f0f0f0',
        },
        {
            value: 80,
            name: i18n.t('Permanent water bodies'),
            color: '#0032c8',
        },
        {
            value: 90,
            name: i18n.t('Herbaceous wetland'),
            color: '#0096a0',
        },
        {
            value: 100,
            name: i18n.t('Moss and lichen'),
            color: '#fae6a0',
        },
        {
            value: 111,
            name: i18n.t('Closed forest, evergreen needle leaf'),
            color: '#58481f',
        },
        {
            value: 112,
            name: i18n.t('Closed forest, evergreen broad leaf'),
            color: '#009900',
        },
        {
            value: 113,
            name: i18n.t('Closed forest, deciduous needle leaf'),
            color: '#70663e',
        },
        {
            value: 114,
            name: i18n.t('Closed forest, deciduous broad leaf'),
            color: '#00cc00',
        },
        {
            value: 115,
            name: i18n.t('Closed forest, mixed'),
            color: '#4e751f',
        },
        {
            value: 116,
            name: i18n.t('Closed forest, other'),
            color: '#007800',
        },
        {
            value: 121,
            name: i18n.t('Open forest, evergreen needle leaf'),
            color: '#666000',
        },
        {
            value: 122,
            name: i18n.t('Open forest, evergreen broad leaf'),
            color: '#8db400',
        },
        {
            value: 123,
            name: i18n.t('Open forest, deciduous needle leaf'),
            color: '#8d7400',
        },
        {
            value: 124,
            name: i18n.t('Open forest, deciduous broad leaf'),
            color: '#a0dc00',
        },
        {
            value: 125,
            name: i18n.t('Open forest, mixed'),
            color: '#929900',
        },
        {
            value: 126,
            name: i18n.t('Open forest, other'),
            color: '#648c00',
        },
        {
            value: 200,
            name: i18n.t('Water'),
            color: '#000080',
        },
    ],
}
