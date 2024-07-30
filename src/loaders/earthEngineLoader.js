import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { precisionRound } from 'd3-format'
import {
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { getEarthEngineLayer } from '../constants/earthEngine.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { hasClasses, getPeriodNameFromFilter } from '../util/earthEngine.js'
import { getDisplayProperty } from '../util/helpers.js'
import { toGeoJson } from '../util/map.js'
import { getRoundToPrecisionFn } from '../util/numbers.js'
import {
    getCoordinateField,
    addAssociatedGeometries,
} from '../util/orgUnits.js'

// Returns a promise
const earthEngineLoader = async (config) => {
    const { rows, aggregationType } = config
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

        dataset = getEarthEngineLayer(layerConfig.id)

        if (dataset) {
            delete layerConfig.id
        }

        delete config.config
    } else {
        dataset = getEarthEngineLayer(layerConfig.id)
    }

    const layer = {
        ...dataset,
        ...config,
        ...layerConfig,
    }

    const { unit, filter, description, source, sourceUrl, band, bands } = layer
    const { name } = dataset || config
    const period = getPeriodNameFromFilter(filter)
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
        title: name,
        period,
        groups,
        unit,
        description,
        source,
        sourceUrl,
    }

    // Create/update legend items from params
    if (!hasClasses(aggregationType) && layer.params) {
        legend.items = createLegend(layer.params)
    }

    return {
        ...layer,
        legend,
        name,
        data,
        alerts,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

export const createLegend = ({ min, max, palette }) => {
    const colors = palette.split(',')
    const step = (max - min) / (colors.length - (min > 0 ? 2 : 1))
    const precision = precisionRound(step, max)
    const valueFormat = getRoundToPrecisionFn(precision)

    let from = min
    let to = valueFormat(min + step)

    return colors.map((color, index) => {
        const item = { color }

        if (index === 0 && min > 0) {
            // Less than min
            item.from = 0
            item.to = min
            item.name = '< ' + min
            to = min
        } else if (from < max) {
            item.from = from
            item.to = to
            item.name = from + ' - ' + to
        } else {
            // Higher than max
            item.from = from
            item.name = '> ' + from
        }

        from = to
        to = valueFormat(min + step * (index + (min > 0 ? 1 : 2)))

        return item
    })
}

export default earthEngineLoader
