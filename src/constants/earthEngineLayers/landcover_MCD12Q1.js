import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'MODIS/006/MCD12Q1', // Layer id kept for backward compability for saved maps
        datasetId: 'MODIS/061/MCD12Q1', // No longer in use: 'MODIS/006/MCD12Q1' / 'MODIS/051/MCD12Q1',
        format: 'ImageCollection',
        img: 'images/landcover.png',
        name: i18n.t('Landcover'),
        description: i18n.t(
            'Distinct landcover types collected from satellites.'
        ),
        source: 'NASA LP DAAC / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MCD12Q1',
        unit: i18n.t('unitless'),
        resolution: {
            spatial: i18n.t('0.5 meter'),
            temporal: i18n.t('Yearly'),
            temporalCoverage: i18n.t('Since 2001'),
        },
        defaultAggregations: 'percentage',
        periodType: 'YEARLY',
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        band: 'LC_Type1',
        style: [
            // http://www.eomf.ou.edu/static/IGBP.pdf
            {
                value: 1,
                name: i18n.t('Evergreen Needleleaf forest'),
                color: '#162103',
            },
            {
                value: 2,
                name: i18n.t('Evergreen Broadleaf forest'),
                color: '#235123',
            },
            {
                value: 3,
                name: i18n.t('Deciduous Needleleaf forest'),
                color: '#399b38',
            },
            {
                value: 4,
                name: i18n.t('Deciduous Broadleaf forest'),
                color: '#38eb38',
            },
            {
                value: 5,
                name: i18n.t('Mixed forest'),
                color: '#39723b',
            },
            {
                value: 6,
                name: i18n.t('Closed shrublands'),
                color: '#6a2424',
            },
            {
                value: 7,
                name: i18n.t('Open shrublands'),
                color: '#c3a55f',
            },
            {
                value: 8,
                name: i18n.t('Woody savannas'),
                color: '#b76124',
            },
            {
                value: 9,
                name: i18n.t('Savannas'),
                color: '#d99125',
            },
            {
                value: 10,
                name: i18n.t('Grasslands'),
                color: '#92af1f',
            },
            {
                value: 11,
                name: i18n.t('Permanent wetlands'),
                color: '#10104c',
            },
            {
                value: 12,
                name: i18n.t('Croplands'),
                color: '#cdb400',
            },
            {
                value: 13,
                name: i18n.t('Urban and built-up'),
                color: '#cc0202',
            },
            {
                value: 14,
                name: i18n.t('Cropland/Natural vegetation mosaic'),
                color: '#332808',
            },
            {
                value: 15,
                name: i18n.t('Snow and ice'),
                color: '#d7cdcc',
            },
            {
                value: 16,
                name: i18n.t('Barren or sparsely vegetated'),
                color: '#f7e174',
            },
            {
                value: 17,
                name: i18n.t('Water'),
                color: '#aec3d6',
            },
        ],
        popup: '{name}: {value}',
        opacity: 0.9,
    }
}
