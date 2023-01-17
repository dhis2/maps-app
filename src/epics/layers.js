import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import {
    addLayer,
    updateLayer,
    loadLayer,
    // tLoadLayer,
} from '../actions/layers.js'
import { closeContextMenu } from '../actions/map.js'
import * as types from '../constants/actionTypes.js'
import { fetchLayer } from '../loaders/layers.js'
import { drillUpDown } from '../util/map.js'

const isNewLayer = (config) => config.id === undefined

// Load one layer
export const loadLayerEpic = (action$) =>
    action$.ofType(types.LAYER_LOAD).concatMap((action) =>
        fetchLayer(action.payload)
            .then((config) =>
                isNewLayer(config) ? addLayer(config) : updateLayer(config)
            )
            .catch(errorActionCreator(types.LAYER_LOAD_ERROR))
    )

export const drillLayer = (action$, store) =>
    action$
        .ofType(types.LAYER_DRILL)
        .concatMap(
            ({ layerId, parentId, parentGraph, level }) =>
                new Promise((resolve) => {
                    // Must return a promise
                    const state = store.getState()
                    const layerConfig = state.map.mapViews.filter(
                        (config) => config.id === layerId
                    )[0]

                    resolve(
                        drillUpDown(layerConfig, parentId, parentGraph, level)
                    )
                })
        )
        .mergeMap((config) => [closeContextMenu(), loadLayer(config)])

export default combineEpics(loadLayerEpic, drillLayer)
