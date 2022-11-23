import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { setDataSets } from '../actions/dataSets.js'
import { errorActionCreator } from '../actions/helpers.js'
import * as types from '../constants/actionTypes.js'
import { getDisplayPropertyUrl } from '../util/helpers.js'

// Load data sets
export const loadDataSets = (action$) =>
    action$.ofType(types.DATA_SETS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.dataSets.list({
                    fields: `dimensionItem~rename(id),${getDisplayPropertyUrl(
                        d2
                    )},legendSet[id]`,
                    paging: false,
                })
            )
            .then((dataSets) => setDataSets(dataSets.toArray()))
            .catch(errorActionCreator(types.DATA_SETS_LOAD_ERROR))
    )

export default combineEpics(loadDataSets)
