import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import { setOrgUnitPath } from '../actions/layerEdit.js'
import {
    setOrgUnitTree,
    setOrgUnitGroups,
    setOrgUnitGroupSets,
} from '../actions/orgUnits.js'
import * as types from '../constants/actionTypes.js'
import { getDisplayPropertyUrl } from '../util/helpers.js'

export const loadOrgUnitTree = (action$) =>
    action$.ofType(types.ORGANISATION_UNIT_TREE_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                // Fetches the root org units associated with the current user with fallback to data capture org units
                d2.models.organisationUnits.list({
                    userDataViewFallback: true,
                    fields: 'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
                })
            )
            .then((modelCollection) =>
                setOrgUnitTree(modelCollection.toArray())
            )
            .catch(errorActionCreator(types.ORGANISATION_UNIT_TREE_LOAD_ERROR))
    )

/*    
export const loadOrgUnitLevels = (action$) =>
    action$.ofType(types.ORGANISATION_UNIT_LEVELS_LOAD).concatMap(() =>
        getD2()
            .then(async (d2) =>
                d2.models.organisationUnitLevels.list({
                    fields: `id,${getDisplayPropertyUrl(d2)},level`,
                    paging: false,
                })
            )
            .then((levels) => setOrgUnitLevels(levels.toArray()))
            .catch(
                errorActionCreator(types.ORGANISATION_UNIT_LEVELS_LOAD_ERROR)
            )
    )
*/

export const loadOrgUnitGroups = (action$) =>
    action$.ofType(types.ORGANISATION_UNIT_GROUPS_LOAD).concatMap(() =>
        getD2()
            .then(async (d2) =>
                d2.models.organisationUnitGroups.list({
                    fields: `id,${getDisplayPropertyUrl(d2)}`,
                    paging: false,
                })
            )
            .then((groups) => setOrgUnitGroups(groups.toArray()))
            .catch(
                errorActionCreator(types.ORGANISATION_UNIT_GROUPS_LOAD_ERROR)
            )
    )

export const loadOrgUnitGroupSets = (action$) =>
    action$.ofType(types.ORGANISATION_UNIT_GROUP_SETS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.organisationUnitGroupSets.list({
                    fields: `id,${getDisplayPropertyUrl(d2)}`,
                    paging: false,
                })
            )
            .then((groupSets) =>
                groupSets.toArray().map(({ id, name }) => ({ id, name }))
            )
            .then(setOrgUnitGroupSets)
            .catch(
                errorActionCreator(
                    types.ORGANISATION_UNIT_GROUP_SETS_LOAD_ERROR
                )
            )
    )

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

export default combineEpics(
    loadOrgUnitTree,
    loadOrgUnitGroups,
    loadOrgUnitGroupSets,
    loadOrgUnitPath
)
