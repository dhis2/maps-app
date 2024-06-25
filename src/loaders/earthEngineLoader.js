import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { precisionRound } from 'd3-format'
import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import {
    hasClasses,
    getStaticFilterFromPeriod,
    getPeriodFromFilter,
} from '../util/earthEngine.js'
import { getDisplayProperty } from '../util/helpers.js'
import { toGeoJson } from '../util/map.js'
import { getRoundToPrecisionFn } from '../util/numbers.js'
import {
    getCoordinateField,
    addAssociatedGeometries,
} from '../util/orgUnits.js'

// Returns a promise
const earthEngineLoader = async (config) => {
    const { format, rows, aggregationType } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const coordinateField = getCoordinateField(config)
    const alerts = []

    let layerConfig = {}
    let dataset
    let features

    if (orgUnits && orgUnits.length) {
        const d2 = await getD2()
        const displayProperty = getDisplayProperty(d2).toUpperCase()
        const orgUnitParams = orgUnits.map((item) => item.id)
        let mainFeatures
        let associatedGeometries

        const featuresRequest = d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)

        try {
            mainFeatures = await featuresRequest.getAll().then(toGeoJson)

            if (coordinateField) {
                associatedGeometries = await featuresRequest
                    .getAll({
                        coordinateField: coordinateField.id,
                    })
                    .then(toGeoJson)

                if (!associatedGeometries.length) {
                    alerts.push({
                        warning: true,
                        message: i18n.t('{{name}}: No coordinates found', {
                            name: coordinateField.name,
                            nsSeparator: ';',
                        }),
                    })
                }
            }

            features = addAssociatedGeometries(
                mainFeatures,
                associatedGeometries
            )

            if (!features.length) {
                alerts.push({
                    warning: true,
                    message: i18n.t(
                        'Selected org units: No coordinates found',
                        {
                            nsSeparator: ';',
                        }
                    ),
                })
            }
        } catch (error) {
            alerts.push({
                critical: true,
                message: i18n.t('Error: {{message}}', {
                    message: error.message,
                    nsSeparator: ';',
                }),
            })
        }
    }

    if (typeof config.config === 'string') {
        // From database as favorite
        layerConfig = JSON.parse(config.config)

        const { filter, params } = layerConfig

        // Backward compability for layers saved before 2.41
        if (filter) {
            layerConfig.period = getPeriodFromFilter(filter, layerConfig.id)
            delete layerConfig.filter
        }

        // Backward compability for layers saved before 2.41
        if (params) {
            layerConfig.style = params
            if (params.palette) {
                layerConfig.style.palette = params.palette.split(',')
            }
            delete layerConfig.params
        }

        // Backward compability for layers with periods saved before 2.36
        // (could also be fixed in a db update script)
        if (layerConfig.image) {
            const filter = layerConfig.filter?.[0]

            if (filter) {
                const period = filter.arguments?.[1]
                let name = String(layerConfig.image)

                if (typeof period === 'string' && period.length > 4) {
                    const year = period.substring(0, 4)
                    filter.year = parseInt(year, 10)

                    if (name.slice(-4) === year) {
                        name = name.slice(0, -4)
                    }
                }

                filter.name = name
            }
        }

        // Backward compability for layers saved before 2.40
        if (typeof layerConfig.params?.palette === 'string') {
            layerConfig.params.palette = layerConfig.params.palette.split(',')
        }

        dataset = getEarthEngineLayer(layerConfig.id)

        if (dataset) {
            delete layerConfig.id
        }

        delete config.config
        delete config.filters // Backend returns empty filters array
    } else {
        dataset = getEarthEngineLayer(layerConfig.id)
    }

    const layer = {
        ...dataset,
        ...config,
        ...layerConfig,
    }

    const {
        unit,
        period,
        filters,
        description,
        source,
        sourceUrl,
        band,
        bands,
        style,
        maskOperator,
    } = layer

    const { name } = dataset || config
    const data =
        Array.isArray(features) && features.length ? features : undefined
    const hasBand = (b) =>
        Array.isArray(band) ? band.includes(b.id) : band === b.id

    const groups =
        band && Array.isArray(bands) && bands.length
            ? bands.filter(hasBand)
            : null

    const legend = {
        ...layer.legend,
        items: Array.isArray(style) ? style : null,
        title: name,
        period: period?.name,
        groups,
        unit,
        description,
        source,
        sourceUrl,
    }

    // Create/update legend items from params
    if (
        format !== 'FeatureCollection' &&
        !hasClasses(aggregationType) &&
        style?.palette
    ) {
        legend.items = createLegend(style, !maskOperator)
    }

    const filter = getStaticFilterFromPeriod(period, filters)

    return {
        ...layer,
        legend,
        name,
        data,
        filter,
        alerts,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

export const createLegend = ({ min, max, palette }, showBelowMin) => {
    const step = (max - min) / (palette.length - (showBelowMin ? 2 : 1))
    const precision = precisionRound(step, max)
    const valueFormat = getRoundToPrecisionFn(precision)

    let from = valueFormat(min)
    let to = valueFormat(min + step)

    return palette.map((color, index) => {
        const item = { color }

        if (index === 0 && showBelowMin) {
            // Less than min
            item.from = -Infinity
            item.to = min
            item.name = '< ' + min
            to = min
        } else if (+from < max) {
            item.from = +from
            item.to = +to
            item.name = from + ' - ' + to
        } else {
            // Higher than max
            item.from = +from
            item.name = '> ' + from
        }

        from = to
        to = valueFormat(min + step * (index + (showBelowMin ? 1 : 2)))

        return item
    })
}

export default earthEngineLoader
