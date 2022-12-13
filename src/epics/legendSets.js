import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import { setLegendSets } from '../actions/legendSets.js'
import * as types from '../constants/actionTypes.js'

// Load data sets
export const loadLegendSets = (action$) =>
    action$.ofType(types.LEGEND_SETS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.legendSets.list({
                    fields: 'id,displayName~rename(name)',
                    paging: false,
                })
            )
            .then((legendSets) => setLegendSets(legendSets.toArray()))
            .catch(errorActionCreator(types.LEGEND_SETS_LOAD_ERROR))
    )

export default combineEpics(loadLegendSets)
