import { arraySort } from './array';
import isArray from 'd2-utilizr/lib/isArray';
import isString from 'd2-utilizr/lib/isString';
import arrayClean from 'd2-utilizr/lib/arrayClean';

export function isValidCoordinate(coord) {
    return isArray(coord)
        && coord.length === 2
        && coord[0] >= -180
        && coord[0] <= 180
        && coord[1] >= -90
        && coord[1] <= 90;
}

export function toGeoJson(organisationUnits, levelOrder) {
    const features = [];

    levelOrder = levelOrder || 'ASC';

    // sort
    arraySort(organisationUnits, levelOrder, 'le');

    organisationUnits.forEach(ou => {
        const coord = JSON.parse(ou.co);
        let gpid = '';
        let gppg = '';
        let type;

        // Only add features with coordinates
        if (coord && coord.length) {
            type = 'Point';
            if (ou.ty === 2) {
                type = 'Polygon';
                if (ou.co.substring(0, 4) === '[[[[') {
                    type = 'MultiPolygon';
                }
            }

            // grand parent
            if (isString(ou.pg) && ou.pg.length) {
                const ids = arrayClean(ou.pg.split('/'));

                // grand parent id
                if (ids.length >= 2) {
                    gpid = ids[ids.length - 2];
                }

                // grand parent parentgraph
                if (ids.length > 2) {
                    gppg = '/' + ids.slice(0, ids.length - 2).join('/');
                }
            }

            features.push({
                type: 'Feature',
                id: ou.id,
                geometry: {
                    type: type,
                    coordinates: coord
                },
                properties: {
                    id: ou.id,
                    name: ou.na,
                    hasCoordinatesDown: ou.hcd,
                    hasCoordinatesUp: ou.hcu,
                    level: ou.le,
                    grandParentParentGraph: gppg,
                    grandParentId: gpid,
                    parentGraph: ou.pg,
                    parentId: ou.pi,
                    parentName: ou.pn
                }
            });
        }

    });

    return features;
}


