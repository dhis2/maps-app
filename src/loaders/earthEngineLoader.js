import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { precisionRound } from 'd3-format'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import {
    hasClasses,
    getStaticFilterFromPeriod,
    getPeriodFromFilter,
} from '../util/earthEngine.js'
import { toGeoJson } from '../util/map.js'
import { getRoundToPrecisionFn } from '../util/numbers.js'
import {
    getCoordinateField,
    addAssociatedGeometries,
} from '../util/orgUnits.js'

// Returns a promise
const earthEngineLoader = async ({ config, nameProperty, userId }) => {
    const { format, rows, aggregationType } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const coordinateField = getCoordinateField(config)
    const alerts = []

    let layerConfig = {}
    let dataset
    let features

    if (orgUnits && orgUnits.length) {
        const d2 = await getD2()

        const geoFeaturesParams = { _: userId }
        const orgUnitParams = orgUnits.map((item) => item.id)
        let mainFeatures
        let associatedGeometries

        const featuresRequest = d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(nameProperty)

        try {
            mainFeatures = await featuresRequest
                .getAll(geoFeaturesParams)
                .then(toGeoJson)

            if (coordinateField) {
                associatedGeometries = await featuresRequest
                    .getAll({
                        ...geoFeaturesParams,
                        coordinateField: coordinateField.id,
                    })
                    .then(toGeoJson)

                if (!associatedGeometries.length) {
                    alerts.push({
                        code: WARNING_NO_GEOMETRY_COORD,
                        message: coordinateField.name,
                    })
                }
            }

            features = addAssociatedGeometries(
                mainFeatures,
                associatedGeometries
            )

            if (!features.length) {
                alerts.push({
                    code: WARNING_NO_OU_COORD,
                    message: i18n.t('Earth Engine layer'),
                })
            }
        } catch (error) {
            alerts.push({
                code: ERROR_CRITICAL,
                message: error.message || error,
            })
        }
    }

    if (typeof config.config === 'string') {
        // From database as favorite
        layerConfig = JSON.parse(config.config)

        if (layerConfig.image) {
            // Backward compability for layers with periods saved before 2.36
            const filter = layerConfig.filter?.[0]

            if (filter) {
                const id = filter.arguments?.[1]
                const name = String(layerConfig.image)
                const year =
                    typeof id === 'string' && id.length > 4
                        ? parseInt(id.substring(0, 4), 10)
                        : undefined

                layerConfig.period = { id, name, year }

                delete layerConfig.filter
            }
            delete layerConfig.image
        } else if (layerConfig.filter) {
            // Backward compability for layers saved before v100.6.0
            layerConfig.period = getPeriodFromFilter(filter, layerConfig.id)
            delete layerConfig.filter
        }

        if (layerConfig.params) {
            // Backward compability for layers saved before v100.6.0
            layerConfig.style = layerConfig.params
            if (typeof layerConfig.params.palette === 'string') {
                layerConfig.style.palette =
                    layerConfig.params.palette.split(',')
            }
            delete layerConfig.params
        }

        dataset = getEarthEngineLayer(layerConfig.id)

        if (dataset) {
            delete layerConfig.id
        }

        delete config.config
        // Remove the always empty filters array from saved map layer object
        // so as not to overwrite the filters array from the layer config
        delete config.filters
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
