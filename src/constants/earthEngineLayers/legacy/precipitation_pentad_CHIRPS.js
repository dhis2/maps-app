import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'
import { BY_YEAR } from '../../periods.js'

export default function createConfig() {
    return {
        legacy: true, // kept for backward compability
        layer: EARTH_ENGINE_LAYER,
        format: 'ImageCollection',
        layerId: 'UCSB-CHG/CHIRPS/PENTAD',
        datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
        name: i18n.t('Precipitation'),
        unit: i18n.t('millimeter'),
        description: i18n.t(
            'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.'
        ),
        source: 'UCSB / CHG / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/UCSB-CHG%2FCHIRPS%2FPENTAD',
        periodType: BY_YEAR,
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        band: 'precipitation',
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        img: 'images/precipitation.png',
        style: {
            min: 0,
            max: 100,
            palette: [
                '#eff3ff',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#3182bd',
                '#08519c',
            ], // Blues (ColorBrewer)
        },
        maskOperator: 'gte',
        opacity: 0.9,
    }
}
