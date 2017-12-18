import { apiFetch } from '../util/api';

// Fetch favorite
export function fetchOrgUnit(id) {
    //const fields = gis.conf.url.mapFields.join(','); // TODO





    return apiFetch(`/maps/${id}.json?fields=${fields}`).then(res => res.json());
}