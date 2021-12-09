import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { closeContextMenu } from '../actions/map';
import { addLayer, updateLayer, loadLayer } from '../actions/layers';
import { errorActionCreator } from '../actions/helpers';
import { fetchLayer } from '../loaders/layers';
import { drillUpDown } from '../util/map';
import { getPeriodFromFilters } from '../util/analytics';
import { getRelativePeriods } from '../util/periods';

const isNewLayer = config => config.id === undefined;

// Load one layer
export const loadLayerEpic = action$ =>
    action$.ofType(types.LAYER_LOAD).concatMap(action =>
        fetchLayer(action.payload)
            .then(config =>
                isNewLayer(config) ? addLayer(config) : updateLayer(config)
            )
            .catch(errorActionCreator(types.LAYER_LOAD_ERROR))
    );

export const drillLayer = (action$, store) =>
    action$
        .ofType(types.LAYER_DRILL)
        .concatMap(
            ({ layerId, parentId, parentGraph, level }) =>
                new Promise(resolve => {
                    // Must return a promise
                    const state = store.getState();
                    const layerConfig = state.map.mapViews.filter(
                        config => config.id === layerId
                    )[0];

                    resolve(
                        drillUpDown(layerConfig, parentId, parentGraph, level)
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
                        period &&
                        getRelativePeriods().find(p => p.id === period.id)
                    );
                })
                .map(config => ({
                    ...config,
                    relativePeriodDate: action.payload,
                }))
        )
        .map(loadLayer);

export default combineEpics(loadLayerEpic, drillLayer, setRelativePeriodDate);
