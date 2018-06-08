import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../util/api';

const geometryTypes = ['POINT', 'POLYGON'];

const trackedEntityLoader = async config => {
    const { trackedEntityType } = config; 
    const orgUnit = 'ImspTQPwCqd'; // TODO

    // https://docs.dhis2.org/master/en/developer/html/webapi_tracker_api.html#d0e14057
    // http://localhost:8080/api/30/trackedEntityInstances?ou=ImspTQPwCqd&trackedEntity=nEenWmSyUEp
    const data = await apiFetch(`/trackedEntityInstances?ou=${orgUnit}&trackedEntityType=${trackedEntityType.id}`);
    const instances = data.trackedEntityInstances.filter(instance => geometryTypes.includes(instance.featureType));

    console.log(instances);

    return {
        ...config,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default trackedEntityLoader;
