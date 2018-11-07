import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import { getInstance as getD2 } from 'd2';
import * as types from '../constants/actionTypes';
import { closeContextMenu } from '../actions/map';
import { addLayer, updateLayer, loadLayer } from '../actions/layers';
import { errorActionCreator } from '../actions/helpers';
import { fetchLayer } from '../loaders/layers';
import { drillUpDown } from '../util/map';
import { getPeriodFromFilters } from '../util/analytics';
import { relativePeriods } from '../constants/periods';

const isNewLayer = config => config.id === undefined;

// Increase edit counter to trigger redraw
const increaseEditCounter = config => ({
    ...config,
    editCounter: config.editCounter === undefined ? 0 : ++config.editCounter,
});

// Load one layer
export const loadLayerEpic = action$ =>
    action$.ofType(types.LAYER_LOAD).concatMap(action =>
        fetchLayer(action.payload)
            .then(increaseEditCounter)
            .then(
                config =>
                    isNewLayer(config) ? addLayer(config) : updateLayer(config)
            )
            .catch(errorActionCreator(types.LAYER_LOAD_ERROR))
    );

export const drillLayer = (action$, store) =>
    action$
        .ofType(types.LAYER_DRILL)
        .concatMap(({ layerId, parentId, parentGraph, level }) =>
            getD2() // TODO: D2 is not needed, just included to return a promise
                .then(d2 => {
                    const state = store.getState();
                    const layerConfig = state.map.mapViews.filter(
                        config => config.id === layerId
                    )[0]; // TODO: Add check

                    return drillUpDown(
                        layerConfig,
                        parentId,
                        parentGraph,
                        level
                    );
                })
        )
        .mergeMap(config => [closeContextMenu(), loadLayer(config)]);

// Reload layers with relative periods using a specific date (from interpretation)
export const setRelativePeriodDate = (action$, store) =>
    action$
        .ofType(types.MAP_RELATIVE_PERIOD_DATE_SET)
        .mergeMap(action =>
            store
                .getState()
                .map.mapViews.filter(config => {
                    const period = getPeriodFromFilters(config.filters);
                    return (
                        period && relativePeriods.find(p => p.id === period.id)
                    );
                })
                .map(config => ({
                    ...config,
                    relativePeriodDate: action.payload,
                }))
        )
        .map(loadLayer);

export default combineEpics(loadLayerEpic, drillLayer, setRelativePeriodDate);
