import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../util/api';
import { getOrgUnitsFromRows } from '../util/analytics';
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
} from '../constants/layers';
import { createAlert } from '../util/alerts';
import { formatLocaleDate } from '../util/time';
import { getDataWithRelationships } from '../util/teiRelationshipsParser';

const fields = [
    'trackedEntityInstance~rename(id)',
    'featureType',
    'coordinates',
];

// Mapping netween DHIS2 types and GeoJSON types
const geometryTypesMap = {
    POINT: 'Point',
    POLYGON: 'Polygon',
    MULTI_POLYGON: 'MultiPolygon',
};

// Valid geometry types for TEIs
const geometryTypes = Object.keys(geometryTypesMap);

//TODO: Refactor to share code with other loaders
const trackedEntityLoader = async config => {
    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        relationshipType: relationshipTypeID,
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
    } = config;

    const name = program ? program.name : i18n.t('Tracked entity');

    const legend = {
        period: `${formatLocaleDate(startDate)} - ${formatLocaleDate(endDate)}`,
        items: [
            {
                name:
                    trackedEntityType.name +
                    (areaRadius ? ` + ${areaRadius} ${'m'} ${'buffer'}` : ''),
                color: eventPointColor || TEI_COLOR,
                radius: eventPointRadius || TEI_RADIUS,
            },
        ],
    };

    const orgUnits = getOrgUnitsFromRows(rows)
        .map(ou => ou.id)
        .join(';');

    const fieldsWithRelationships = [...fields, 'relationships'];
    // https://docs.dhis2.org/2.29/en/developer/html/webapi_tracked_entity_instance_query.html
    let url = `/trackedEntityInstances?skipPaging=true&fields=${fieldsWithRelationships}&ou=${orgUnits}`;
    let alert;

    if (organisationUnitSelectionMode) {
        url += `&ouMode=${organisationUnitSelectionMode}`;
    }

    if (program) {
        url += `&program=${
            program.id
        }&programStatus=${programStatus}&programStartDate=${startDate}&programEndDate=${endDate}`;

        if (followUp !== undefined) {
            url += `&followUp=${followUp ? 'TRUE' : 'FALSE'}`;
        }
    } else {
        url += `&trackedEntityType=${
            trackedEntityType.id
        }&lastUpdatedStartDate=${startDate}&lastUpdatedEndDate=${endDate}`;
    }

    // https://docs.dhis2.org/master/en/developer/html/webapi_tracker_api.html#webapi_tei_grid_query_request_syntax
    const primaryData = await apiFetch(url);

    const instances = primaryData.trackedEntityInstances.filter(
        instance =>
            geometryTypes.indexOf(instance.featureType) >= 0 &&
            instance.coordinates
    );

    if (!instances.length) {
        alert = createAlert(
            trackedEntityType.name,
            i18n.t('No tracked entities found')
        );
    }

    let data, relationships, secondaryData;

    if (relationshipTypeID) {
        const relationshipType = await apiFetch(
            `/relationshipTypes/${relationshipTypeID}`
        );

        const relatedTypeId =
            relationshipType.toConstraint.trackedEntityType.id;
        const relatedEntityType = await apiFetch(
            `/trackedEntityTypes/${relatedTypeId}?fields=displayName`
        );

        legend.items.push(
            {
                name: relationshipType.displayName,
                color: relationshipLineColor || TEI_RELATIONSHIP_LINE_COLOR,
                weight: 1,
            },
            {
                name: `${relatedEntityType.displayName} (${i18n.t('related')})`,
                color: relatedPointColor || TEI_RELATED_COLOR,
                radius: relatedPointRadius || TEI_RELATED_RADIUS,
            }
        );

        const dataWithRels = await getDataWithRelationships(
            instances,
            relationshipType,
            {
                orgUnits,
                organisationUnitSelectionMode,
            }
        );

        data = toGeoJson(dataWithRels.primary);
        relationships = dataWithRels.relationships;
        secondaryData = toGeoJson(dataWithRels.secondary);
    } else {
        data = toGeoJson(instances);
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
        isExpanded: true,
        isVisible: true,
    };
};

const toGeoJson = instances =>
    instances.map(({ id, featureType, coordinates }) => ({
        type: 'Feature',
        geometry: {
            type: geometryTypesMap[featureType],
            coordinates: JSON.parse(coordinates),
        },
        id,
        properties: {},
    }));

export default trackedEntityLoader;
