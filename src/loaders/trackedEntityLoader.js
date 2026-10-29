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
import { numberValueTypes } from '../constants/valueTypes.js'
import { getOrgUnitsFromRows } from '../util/analytics.js'
import { parseJsonConfig } from '../util/config.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
    GEO_TYPE_LINE,
    GEO_TYPE_FEATURE,
} from '../util/geojson.js'
import { parseWithSeparator } from '../util/numbers.js'
import { getDataWithRelationships } from '../util/teiRelationshipsParser.js'
import { trimTime, formatStartEndDate, getDateArray } from '../util/time.js'

const fields = ['trackedEntity~rename(id)', 'geometry', 'attributes']

// Valid geometry types for TEIs
const teiGeometryTypes = new Set([
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
])

const TEI_40_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
    }) => ({
        fields,
        orgUnit: orgUnits,
        ouMode: orgUnitMode,
        program: program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        skipPaging: true,
    }),
}

const TEI_41_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        // TODO no followUp?
    }) => ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

const RELATIONSHIP_TYPES_QUERY = {
    resource: 'relationshipTypes',
    id: ({ id }) => id,
}

const TRACKED_ENTITY_TYPES_QUERY = {
    resource: 'trackedEntityTypes',
    id: ({ id }) => id,
    params: {
        fields: 'displayName,featureType',
    },
}

export const getAttributeProperties = (attributes) =>
    Object.fromEntries(
        (attributes ?? []).map(({ attribute, value, valueType }) => [
            attribute,
            numberValueTypes.includes(valueType)
                ? parseWithSeparator(value)
                : value,
        ])
    )

export const getAttributeHeaders = (instances) => {
    const headersByAttribute = new Map()
    instances.forEach(({ attributes }) => {
        ;(attributes ?? []).forEach(({ attribute, displayName, valueType }) => {
            if (!headersByAttribute.has(attribute)) {
                headersByAttribute.set(attribute, {
                    name: displayName,
                    dataKey: attribute,
                    valueType,
                })
            }
        })
    })
    return [...headersByAttribute.values()]
}

// The main tracked entity marker's own color is currently fixed still
// stamped here for when data table's Color column has real data
export const toGeoJson = (instances, color) =>
    instances.map(({ id, geometry, attributes }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
            color,
            ...getAttributeProperties(attributes),
        },
    }))

export const applyParsedConfig = (config) => {
    const { relationships, periodType, dataTableColumnConfig } =
        parseJsonConfig(config.config)

    if (relationships) {
        config.relationshipType = relationships.type
        config.relatedPointColor = relationships.pointColor
        config.relatedPointRadius = relationships.pointRadius
        config.relationshipLineColor = relationships.lineColor
        config.relationshipOutsideProgram =
            relationships.relationshipOutsideProgram
    }

    config.periodType = periodType

    if (dataTableColumnConfig) {
        config.dataTableColumnConfig = dataTableColumnConfig
    }

    delete config.config
}

const fetchRelationshipData = async ({
    engine,
    isVersion40,
    instances,
    relationshipTypeID,
    orgUnits,
    organisationUnitSelectionMode,
    relatedPointColor,
    relatedPointRadius,
    relationshipLineColor,
    pointColor,
    legend,
}) => {
    const { relationshipType } = await engine.query(
        { relationshipType: RELATIONSHIP_TYPES_QUERY },
        { variables: { id: relationshipTypeID } }
    )

    const { relatedEntityType } = await engine.query(
        { relatedEntityType: TRACKED_ENTITY_TYPES_QUERY },
        {
            variables: {
                id: relationshipType.toConstraint.trackedEntityType.id,
            },
        }
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
            weight: isPoint ? undefined : 1,
        }
    )

    const dataWithRels = await getDataWithRelationships({
        isVersion40,
        instances,
        queryOptions: {
            relationshipType,
            orgUnits,
            organisationUnitSelectionMode,
        },
        engine,
    })

    return {
        data: toGeoJson(dataWithRels.primary, pointColor),
        relationships: dataWithRels.relationships,
        secondaryData: toGeoJson(dataWithRels.secondary),
    }
}

const buildQueryVariables = ({
    fields,
    orgUnits,
    orgUnitMode,
    program,
    programStatus,
    followUp,
    trackedEntityType,
    periodType,
    startDate,
    endDate,
}) => {
    const followUpBool = followUp ? 'TRUE' : 'FALSE'
    const boolFollowUp =
        program && followUp !== undefined ? followUpBool : undefined

    return {
        fields,
        orgUnits,
        orgUnitMode,
        program: program?.id,
        programStatus,
        followUp: boolFollowUp,
        trackedEntityType: program ? undefined : trackedEntityType?.id,
        enrollmentEnrolledAfter:
            periodType === 'program' ? trimTime(startDate) : undefined,
        enrollmentEnrolledBefore:
            periodType === 'program' ? trimTime(endDate) : undefined,
        updatedAfter:
            periodType === 'program' ? undefined : trimTime(startDate),
        updatedBefore: periodType === 'program' ? undefined : trimTime(endDate),
    }
}

const trackedEntityLoader = async ({
    config,
    engine,
    keyAnalysisDigitGroupSeparator,
    serverVersion,
}) => {
    applyParsedConfig(config)

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
    const pointColor = eventPointColor || TEI_COLOR

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
                color: pointColor,
                radius: eventPointRadius || TEI_RADIUS,
            },
        ],
    }

    // VERSION-TOGGLE: https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
    const isVersion40 = `${serverVersion.minor}` === '40'

    const orgUnits = getOrgUnitsFromRows(rows)
        .map((ou) => ou.id)
        .join(isVersion40 ? ';' : ',')

    const fieldsWithRelationships = [...fields, 'relationships']
    let explanation

    if (program && programStatus) {
        explanation = `${i18n.t('Program status')}: ${
            getProgramStatuses().find((s) => s.id === programStatus).name
        }`
    }

    const { trackedEntities } = await engine.query(
        { trackedEntities: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
        {
            variables: buildQueryVariables({
                fields: fieldsWithRelationships,
                orgUnits,
                orgUnitMode: organisationUnitSelectionMode,
                program,
                programStatus,
                followUp,
                trackedEntityType,
                periodType,
                startDate,
                endDate,
            }),
        }
    )

    const instances = trackedEntities[
        isVersion40 ? 'instances' : 'trackedEntities'
    ].filter(
        (instance) =>
            teiGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    const headers = getAttributeHeaders(instances)

    let alert

    if (!instances.length) {
        alert = {
            code: WARNING_NO_DATA,
            message: trackedEntityType.name,
        }
    }

    let data, relationships, secondaryData

    if (relationshipTypeID) {
        ;({ data, relationships, secondaryData } = await fetchRelationshipData({
            engine,
            isVersion40,
            instances,
            relationshipTypeID,
            orgUnits,
            organisationUnitSelectionMode,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
            pointColor,
            legend,
        }))
    } else {
        data = toGeoJson(instances, pointColor)
    }

    if (explanation) {
        legend.explanation = [explanation]
    }

    return {
        ...config,
        name,
        data,
        headers,
        keyAnalysisDigitGroupSeparator,
        relationships,
        secondaryData,
        legend,
        ...(alert ? { alerts: [alert] } : {}),
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
    }
}

export default trackedEntityLoader
