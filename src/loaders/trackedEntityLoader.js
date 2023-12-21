import i18n from '@dhis2/d2-i18n'
import { WARNING_NO_DATA } from '../constants/alerts.js'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
} from '../constants/layers.js'
import { getProgramStatuses } from '../constants/programStatuses.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { apiFetch } from '../util/api.js'
import { getDataWithRelationships } from '../util/teiRelationshipsParser.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'

const fields = [
    'trackedEntityInstance~rename(id)',
    'featureType',
    'coordinates',
]

// Mapping netween DHIS2 types and GeoJSON types
const geometryTypesMap = {
    POINT: 'Point',
    POLYGON: 'Polygon',
    MULTI_POLYGON: 'MultiPolygon',
}

// Valid geometry types for TEIs
const geometryTypes = Object.keys(geometryTypesMap)

//TODO: Refactor to share code with other loaders
const trackedEntityLoader = async (config) => {
    if (config.config && typeof config.config === 'string') {
        try {
            const customConfig = JSON.parse(config.config)
            config.relationshipType = customConfig.relationships.type
            config.relatedPointColor = customConfig.relationships.pointColor
            config.relatedPointRadius = customConfig.relationships.pointRadius
            config.relationshipLineColor = customConfig.relationships.lineColor
            config.relationshipOutsideProgram =
                customConfig.relationships.relationshipOutsideProgram
            config.periodType = customConfig.periodType
        } catch (e) {
            // Failed to load JSON relationship config, assuming no relationships
        }
        delete config.config
    }

    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        relationshipType: relationshipTypeID,
        periodType,
        startDate,
        endDate,
        rows,
        organisationUnitSelectionMode,
        eventPointColor,
        eventPointRadius,
        areaRadius,
        relatedPointColor,
        relatedPointRadius,
        relationshipLineColor,
    } = config

    const name = program ? program.name : i18n.t('Tracked entity')

    const legend = {
        title: name,
        period: formatStartEndDate(
            getDateArray(startDate),
            getDateArray(endDate)
        ),
        items: [
            {
                name:
                    trackedEntityType.name +
                    (areaRadius ? ` + ${areaRadius} ${'m'} ${'buffer'}` : ''),
                color: eventPointColor || TEI_COLOR,
                radius: eventPointRadius || TEI_RADIUS,
            },
        ],
    }

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(';')

    const fieldsWithRelationships = [...fields, 'relationships']
    // https://docs.dhis2.org/2.29/en/developer/html/webapi_tracked_entity_instance_query.html
    let url = `/trackedEntityInstances?skipPaging=true&fields=${fieldsWithRelationships}&ou=${orgUnits}`
    let alert
    let explanation

    if (organisationUnitSelectionMode) {
        url += `&ouMode=${organisationUnitSelectionMode}`
    }

    if (program) {
        url += `&program=${program.id}`

        if (programStatus) {
            url += `&programStatus=${programStatus}`
            explanation = `${i18n.t('Program status')}: ${
                getProgramStatuses().find((s) => s.id === programStatus).name
            }`
        }

        if (followUp !== undefined) {
            url += `&followUp=${followUp ? 'TRUE' : 'FALSE'}`
        }
    } else {
        url += `&trackedEntityType=${trackedEntityType.id}`
    }

    if (periodType === 'program') {
        url += `&programStartDate=${startDate}&programEndDate=${endDate}`
    } else {
        url += `&lastUpdatedStartDate=${startDate}&lastUpdatedEndDate=${endDate}`
    }

    // https://docs.dhis2.org/master/en/developer/html/webapi_tracker_api.html#webapi_tei_grid_query_request_syntax
    const primaryData = await apiFetch(url)

    const instances = primaryData.trackedEntityInstances.filter(
        (instance) =>
            geometryTypes.includes(instance.featureType) && instance.coordinates
    )

    if (!instances.length) {
        alert = {
            warning: true,
            code: WARNING_NO_DATA,
            message: `${trackedEntityType.name}: ${i18n.t(
                'No tracked entities found'
            )}`,
        }
    }

    let data, relationships, secondaryData

    if (relationshipTypeID) {
        const relationshipType = await apiFetch(
            `/relationshipTypes/${relationshipTypeID}`
        )

        const relatedTypeId = relationshipType.toConstraint.trackedEntityType.id
        const relatedEntityType = await apiFetch(
            `/trackedEntityTypes/${relatedTypeId}?fields=displayName,featureType`
        )
        const isPoint = relatedEntityType.featureType === 'POINT'

        legend.items.push(
            {
                type: 'LineString',
                name: relationshipType.displayName,
                color: relationshipLineColor || TEI_RELATIONSHIP_LINE_COLOR,
                weight: 1,
            },
            {
                name: `${relatedEntityType.displayName} (${i18n.t('related')})`,
                color: relatedPointColor || TEI_RELATED_COLOR,
                radius: isPoint
                    ? relatedPointRadius || TEI_RELATED_RADIUS
                    : undefined,
                weight: !isPoint ? 1 : undefined,
            }
        )

        const dataWithRels = await getDataWithRelationships(
            instances,
            relationshipType,
            {
                orgUnits,
                organisationUnitSelectionMode,
            }
        )

        data = toGeoJson(dataWithRels.primary)
        relationships = dataWithRels.relationships
        secondaryData = toGeoJson(dataWithRels.secondary)
    } else {
        data = toGeoJson(instances)
    }

    if (explanation) {
        legend.explanation = [explanation]
    }

    return {
        ...config,
        name,
        data,
        relationships,
        secondaryData,
        legend,
        ...(alert ? { alerts: [alert] } : {}),
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
    }
}

const toGeoJson = (instances) =>
    instances.map(({ id, featureType, coordinates }) => ({
        type: 'Feature',
        geometry: {
            type: geometryTypesMap[featureType],
            coordinates: JSON.parse(coordinates),
        },
        properties: {
            id,
        },
    }))

export default trackedEntityLoader
