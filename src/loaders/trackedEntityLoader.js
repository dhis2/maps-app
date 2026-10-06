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
import { GEO_TYPE_POINT, GEO_TYPE_LINE } from '../util/geojson.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'
import {
    createTrackedEntityInstanceFeatures,
    loadTrackedEntitiesFromTracker,
} from '../util/trackedEntity.js'
import { getDataWithRelationships } from '../util/trackedEntityRelationships.js'
import { serverSupportsTracker41Api } from '../util/versionToggle.js'

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

export const parseJsonConfig = (config) => {
    if (!config.config || typeof config.config !== 'string') {
        return
    }

    try {
        const { relationships, periodType } = JSON.parse(config.config)

        if (relationships) {
            config.relationshipType = relationships.type
            config.relatedPointColor = relationships.pointColor
            config.relatedPointRadius = relationships.pointRadius
            config.relationshipLineColor = relationships.lineColor
            config.relationshipOutsideProgram =
                relationships.relationshipOutsideProgram
        }

        config.periodType = periodType
    } catch (e) {
        // Malformed config JSON
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
        data: createTrackedEntityInstanceFeatures(dataWithRels.primary),
        relationships: dataWithRels.relationships,
        secondaryData: createTrackedEntityInstanceFeatures(
            dataWithRels.secondary
        ),
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
        relationshipType: relationshipTypeID,
        startDate,
        endDate,
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

    let explanation

    if (program && programStatus) {
        explanation = `${i18n.t('Program status')}: ${
            getProgramStatuses().find((s) => s.id === programStatus).name
        }`
    }

    const { instances, orgUnits } = await loadTrackedEntitiesFromTracker({
        config,
        engine,
        serverVersion,
    })

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
            // VERSION-TOGGLE: see util/versionToggle.js
            isVersion40: !serverSupportsTracker41Api(serverVersion),
            instances,
            relationshipTypeID,
            orgUnits,
            organisationUnitSelectionMode,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
            legend,
        }))
    } else {
        data = createTrackedEntityInstanceFeatures(instances)
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
    }
}

export default trackedEntityLoader
