import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../util/api';

const geometryTypes = ['POINT', 'POLYGON'];

const trackedEntityLoader = async config => {
    const { trackedEntityType, program, } = config; 
    const orgUnit = 'ImspTQPwCqd'; // TODO
    let url = `/trackedEntityInstances?ou=${orgUnit}&trackedEntityType=${trackedEntityType.id}`;

    if (program) {
        url += `&program=${program.id}`;
    }

    console.log(program);

    // https://docs.dhis2.org/master/en/developer/html/webapi_tracker_api.html#d0e14057
    // http://localhost:8080/api/30/trackedEntityInstances?ou=ImspTQPwCqd&trackedEntity=nEenWmSyUEp
    const data = await apiFetch(url);
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
