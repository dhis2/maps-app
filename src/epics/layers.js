import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { closeContextMenu } from '../actions/map';
import { addLayer, updateLayer } from '../actions/layers';
import { errorActionCreator } from '../actions/helpers';
import { fetchLayer } from '../loaders/layers';
import { dimConf } from '../constants/dimension';

const isNewLayer = (config) => config.id === undefined;

// Load one layer
export const loadLayerEpic = (action$) =>
    action$
        .ofType(types.LAYER_LOAD)
        .concatMap((action) =>
            fetchLayer(action.payload)
                .then(config => isNewLayer(config) ? addLayer(config) : updateLayer(config))
                .catch(errorActionCreator(types.MAP_LOAD_ERROR))
        );

export const drillLayer = (action$, store) =>
    action$
        .ofType(types.LAYER_DRILL)
        .concatMap(({ layerId, parentId, parentGraph, level }) => {
            const state = getState();
            const layer = state.map.overlays.filter(overlay => overlay.id === layerId)[0]; // TODO: Add check

            const overlay = {
                ...layer,
                rows: [{
                    dimension: dimConf.organisationUnit.objectName,
                    items: [
                        { id: parentId },
                        { id: 'LEVEL-' + level }
                    ]
                }],
                parentGraphMap: {}
            };

            // layer.parentGraphMap[parentId] = parentGraph; // needed ??
        })
        .mergeMap((config) => [ closeContextMenu(), loadLayer(overlay) ]);

export default combineEpics(loadLayerEpic, drillLayer);
