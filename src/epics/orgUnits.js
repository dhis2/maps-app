import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import { setOrgUnitPath } from '../actions/layerEdit.js'
import * as types from '../constants/actionTypes.js'

// Load organisation unit tree path (temporary solution, as favorites don't include paths)
export const loadOrgUnitPath = (action$) =>
    action$
        .ofType(types.LAYER_EDIT_ORGANISATION_UNIT_PATH_LOAD)
        .concatMap((action) =>
            getD2()
                .then(async (d2) =>
                    d2.models.organisationUnit.get(action.id, {
                        fields: 'path',
                    })
                )
                .then((ou) => setOrgUnitPath(action.id, ou.path))
                .catch(
                    errorActionCreator(
                        types.LAYER_EDIT_ORGANISATION_UNIT_PATH_LOAD_ERROR
                    )
                )
        )

export default combineEpics(loadOrgUnitPath)
