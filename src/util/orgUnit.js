import { apiFetch } from '../util/api';

// Updates the database coordinate for an organisation unit (relocate or swapped)
export function changeCoordinate(id, coordinate) {

    // TODO: Backend should accept proper JSON so we don't have to add quotes around arrays
    return apiFetch('/organisationUnits/' + id, 'PATCH', {coordinates: JSON.stringify(coordinate)});
}
