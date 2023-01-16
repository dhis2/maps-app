import { getInstance as getD2 } from 'd2'
import 'rxjs/add/operator/concatMap'
import { sortBy } from 'lodash/fp'
import { combineEpics } from 'redux-observable'
import {
    setDataElementGroups,
    setDataElementOperands,
} from '../actions/dataElements.js'
import { errorActionCreator } from '../actions/helpers.js'
import * as types from '../constants/actionTypes.js'
import { apiFetch } from '../util/api.js'
import { getDisplayPropertyUrl } from '../util/helpers.js'

// Load all data element groups
export const loadDataElementGroups = (action$) =>
    action$.ofType(types.DATA_ELEMENT_GROUPS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.dataElementGroups.list({
                    fields: `id,${getDisplayPropertyUrl()}`,
                    paging: false,
                })
            )
            .then((groups) =>
                setDataElementGroups(sortBy('name', groups.toArray()))
            )
            .catch(errorActionCreator(types.PROGRAMS_LOAD_ERROR))
    )

// Load data element operands in one group
// dataElementOperands is not supported by d2 as these operands are *not persisted*. They are generated based on the
// data elements, their category combo and then all possible operands (data element+option combo) are generated based on
// that so it does not really follow the standard metadata objects nor does it have a schema
// there should be some flexibility for custom URL requests here, in d2 or elsewhere
export const loadDataElementOperands = (action$) =>
    action$.ofType(types.DATA_ELEMENT_OPERANDS_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                apiFetch(
                    `/dataElementOperands?fields=id,${getDisplayPropertyUrl(
                        d2
                    )}&paging=false&filter=dataElement.dataElementGroups.id:eq:${
                        action.groupId
                    }`
                )
            )
            .then((data) =>
                setDataElementOperands(action.groupId, data.dataElementOperands)
            )
    )

export default combineEpics(loadDataElementGroups, loadDataElementOperands)
