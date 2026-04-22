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

const parseJsonConfig = (config) => {
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
        data: toGeoJson(dataWithRels.primary),
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
    parseJsonConfig(config)

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
            teiGeometryTypes.includes(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    let alert

    if (!instances.length) {
        alert = {
            code: WARNING_NO_DATA,
            message: trackedEntityType.name,
        }
    }

    let data = toGeoJson(instances)
    let relationships, secondaryData

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
            legend,
        }))
    }

    if (explanation) {
        legend.explanation = [explanation]
    }

    return {
        ...config,
        name,
        data,
        keyAnalysisDigitGroupSeparator,
        relationships,
        secondaryData,
        legend,
        ...(alert ? { alerts: [alert] } : {}),
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: config.isVisible ?? true,
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
