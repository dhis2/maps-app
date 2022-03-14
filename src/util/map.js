import { compact, sortBy, isString } from 'lodash/fp';
import { dimConf } from '../constants/dimension';

export const isValidCoordinate = coord =>
    Array.isArray(coord) &&
    coord.length === 2 &&
    coord[0] >= -180 &&
    coord[0] <= 180 &&
    coord[1] >= -90 &&
    coord[1] <= 90;

export const toGeoJson = organisationUnits =>
    sortBy('le', organisationUnits)
        .map(ou => {
            const coord = JSON.parse(ou.co);
            let gpid = '';
            let gppg = '';
            let type = 'Point';

            if (ou.ty === 2) {
                type = 'Polygon';
                if (ou.co.substring(0, 4) === '[[[[') {
                    type = 'MultiPolygon';
                }
            }

            // Grand parent
            if (isString(ou.pg) && ou.pg.length) {
                const ids = compact(ou.pg.split('/'));

                // Grand parent id
                if (ids.length >= 2) {
                    gpid = ids[ids.length - 2];
                }

                // Grand parent parent graph
                if (ids.length > 2) {
                    gppg = '/' + ids.slice(0, ids.length - 2).join('/');
                }
            }

            return {
                type: 'Feature',
                id: ou.id,
                geometry: {
                    type,
                    coordinates: coord,
                },
                properties: {
                    type,
                    id: ou.id,
                    name: ou.na,
                    hasCoordinatesDown: ou.hcd,
                    hasCoordinatesUp: ou.hcu,
                    level: ou.le,
                    grandParentParentGraph: gppg,
                    grandParentId: gpid,
                    parentGraph: ou.pg,
                    parentId: ou.pi,
                    parentName: ou.pn,
                    dimensions: ou.dimensions,
                },
            };
        })
        .filter(
            ({ geometry }) =>
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length &&
                geometry.coordinates.flat().length
        );

export const drillUpDown = (layerConfig, parentId, parentGraph, level) => ({
    ...layerConfig,
    rows: [
        {
            dimension: dimConf.organisationUnit.objectName,
            items: [
                { id: parentId, path: `${parentGraph}/${parentId}` },
                { id: 'LEVEL-' + level },
            ],
        },
    ],
});

// Called when plugin maps enter or exit fullscreen
export const onFullscreenChange = (map, isFullscreen = false) => {
    map.resize();

    if (!isFullscreen) {
        const bounds = map.getLayersBounds();

        if (Array.isArray(bounds)) {
            map.fitBounds(bounds);
        }
    }

    map.toggleMultiTouch(!isFullscreen);
    map.toggleScrollZoom(isFullscreen);
};
