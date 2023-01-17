import log from 'loglevel'
import * as types from '../constants/actionTypes.js'
import {
    clearAnalyticalObjectFromUrl,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../util/analyticalObject.js'
import { loadLayer } from './layers.js'

export const setAnalyticalObject = (ao) => ({
    type: types.ANALYTICAL_OBJECT_SET,
    payload: ao,
})

export const clearAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_CLEAR,
})

export const tSetAnalyticalObject = (ao) => async (dispatch) => {
    try {
        clearAnalyticalObjectFromUrl()
        return hasSingleDataDimension(ao)
            ? getThematicLayerFromAnalyticalObject(ao).then((layer) =>
                  dispatch(loadLayer(layer))
              )
            : dispatch(setAnalyticalObject(ao))
    } catch (e) {
        log.error('Could not load current analytical object')
        return e
    }
}
