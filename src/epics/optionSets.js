import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import { addOptionSet } from '../actions/optionSets.js'
import * as types from '../constants/actionTypes.js'

const fields =
    'id,displayName~rename(name),options[id,code,displayName~rename(name),style[color]]'

// Load option set
export const loadOptionSet = (action$) =>
    action$.ofType(types.OPTION_SET_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.optionSets.get(action.id, {
                    fields,
                    paging: false,
                })
            )
            .then((optionSet) => addOptionSet(optionSet))
            .catch(errorActionCreator(types.OPTION_SET_LOAD_ERROR))
    )

export default combineEpics(loadOptionSet)
