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
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
    GEO_TYPE_LINE,
    GEO_TYPE_FEATURE,
} from '../util/geojson.js'
import { getDataWithRelationships } from '../util/teiRelationshipsParser.js'
import { trimTime, formatStartEndDate, getDateArray } from '../util/time.js'

const fields = ['trackedEntity~rename(id)', 'geometry']

// Valid geometry types for TEIs
const teiGeometryTypes = [
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
]

//TODO: Refactor to share code with other loaders
const trackedEntityLoader = async (config, serverVersion) => {
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

    // https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
    let trackerRootProp,
        trackerOrgUnitsParam,
        trackerOrgUnitsModeParam,
        trackerValuesSeparator,
        trackerPaging
    if (`${serverVersion.major}.${serverVersion.minor}` == '2.40') {
        trackerRootProp = 'instances'
        trackerOrgUnitsParam = 'orgUnit'
        trackerOrgUnitsModeParam = 'ouMode'
        trackerValuesSeparator = ';'
        trackerPaging = 'skipPaging=true'
    } else {
        trackerRootProp = 'trackedEntities'
        trackerOrgUnitsParam = 'orgUnits'
        trackerOrgUnitsModeParam = 'orgUnitMode'
        trackerValuesSeparator = ','
        trackerPaging = 'paging=false'
    }

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(trackerValuesSeparator)

    const fieldsWithRelationships = [...fields, 'relationships']
    let url = `/tracker/trackedEntities?${trackerPaging}&fields=${fieldsWithRelationships}&${trackerOrgUnitsParam}=${orgUnits}`
    let alert
    let explanation

    if (organisationUnitSelectionMode) {
        url += `&${trackerOrgUnitsModeParam}=${organisationUnitSelectionMode}`
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
        url += `&enrollmentEnrolledAfter=${trimTime(
            startDate
        )}&enrollmentEnrolledBefore=${trimTime(endDate)}`
    } else {
        url += `&updatedAfter=${trimTime(startDate)}&updatedBefore=${trimTime(
            endDate
        )}`
    }

    const primaryData = await apiFetch(url)
    const instances = primaryData[trackerRootProp].filter(
        (instance) =>
            teiGeometryTypes.includes(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    if (!instances.length) {
        alert = {
            code: WARNING_NO_DATA,
            message: trackedEntityType.name,
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
        const isPoint =
            relatedEntityType.featureType === GEO_TYPE_POINT.toUpperCase()

        legend.items.push(
            {
                type: GEO_TYPE_LINE,
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
            serverVersion,
            instances,
            {
                relationshipType,
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
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

export default trackedEntityLoader
