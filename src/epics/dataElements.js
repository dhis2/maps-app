import { getInstance as getD2 } from 'd2'
import 'rxjs/add/operator/concatMap'
import { combineEpics } from 'redux-observable'
import { setDataElementOperands } from '../actions/dataElements.js'
import * as types from '../constants/actionTypes.js'
import { apiFetch } from '../util/api.js'
import { getDisplayPropertyUrl } from '../util/helpers.js'

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

export default combineEpics(loadDataElementOperands)
