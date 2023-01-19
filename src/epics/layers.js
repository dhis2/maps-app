import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { updateLayer } from '../actions/layers.js'
import { closeContextMenu } from '../actions/map.js'
import * as types from '../constants/actionTypes.js'
import { drillUpDown } from '../util/map.js'

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
        .mergeMap((config) => [closeContextMenu(), updateLayer(config)])

export default combineEpics(drillLayer)
