import { timeFormat } from 'd3-time-format';
import { apiFetch } from '../util/api';
import { getOrgUnitsFromRows } from '../util/analytics';
import { TEI_COLOR, TEI_RADIUS } from '../constants/layers';

const fields = [
    'trackedEntityInstance~rename(id)',
    'featureType',
    'coordinates',
];
const geometryTypes = ['POINT', 'POLYGON'];

const formatTime = date => timeFormat('%Y-%m-%d')(new Date(date));

const trackedEntityLoader = async config => {
    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        startDate,
        endDate,
        rows,
        ouMode,
        eventPointColor,
        eventPointRadius,
        areaRadius,
    } = config;

    const legend = {
        period: `${formatTime(startDate)} - ${formatTime(endDate)}`,
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

    let url = `/trackedEntityInstances?skipPaging=false&fields=${fields}&ou=${orgUnits}`;

    if (ouMode) {
        url += `&ouMode=${ouMode}`;
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
    const data = await apiFetch(url);

    const instances = data.trackedEntityInstances.filter(instance =>
        geometryTypes.includes(instance.featureType)
    );

    const features = toGeoJson(instances);

    return {
        ...config,
        name: program ? program.name : trackedEntityType.name,
        data: features,
        legend,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

const toGeoJson = instances =>
    instances
        .filter(instance => geometryTypes.includes(instance.featureType))
        .map(instance => ({
            type: 'Feature',
            geometry: {
                type:
                    instance.featureType === 'POINT' ? 'Point' : 'MultiPolygon',
                    coordinates: JSON.parse(instance.coordinates),
            },
            id: instance.id,
            properties: {},
        }));

export default trackedEntityLoader;
