import { apiFetch } from '../util/api';
import { getOrgUnitsFromRows } from '../util/analytics';

const geometryTypes = ['POINT', 'POLYGON'];

const trackedEntityLoader = async config => {
    const { trackedEntityType, program, rows } = config; 
    const orgUnits = getOrgUnitsFromRows(rows).map(ou => ou.id).join(';'); // TODO: use ouMode?

    let url = `/trackedEntityInstances?skipPaging=false&ou=${orgUnits}&trackedEntityType=${trackedEntityType.id}`;

    if (program) {
        url += `&program=${program.id}`;
    }

    // https://docs.dhis2.org/master/en/developer/html/webapi_tracker_api.html#webapi_tei_grid_query_request_syntax
    // http://localhost:8080/api/30/trackedEntityInstances?ou=ImspTQPwCqd&trackedEntity=nEenWmSyUEp
    const data = await apiFetch(url);

    console.log(data);

    const instances = data.trackedEntityInstances.filter(instance => geometryTypes.includes(instance.featureType));

    const features = toGeoJson(instances);

    return {
        ...config,
        name: trackedEntityType.name,
        data: features,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

const toGeoJson = (instances) => 
    instances
        .filter(instance => geometryTypes.includes(instance.featureType))
        .map(instance => ({
            type: 'Feature',
            geometry: {
                type: instance.featureType === 'POINT' ? 'Point' : 'MultiPolygon',
                coordinates: JSON.parse(instance.coordinates),
            },
            properties: {},
        }));  

export default trackedEntityLoader;
