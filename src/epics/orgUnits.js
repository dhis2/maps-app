import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';
import { apiFetch } from '../util/api';
import {
    setOrgUnit,
    setOrgUnitTree,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setOrgUnitGroupSets,
    setOrgUnitCoordinate,
} from '../actions/orgUnits';
import { setOrgUnitPath } from '../actions/layerEdit';

export const loadOrgUnit = action$ =>
    action$.ofType(types.ORGANISATION_UNIT_LOAD).concatMap(action =>
        getD2()
            .then(d2 =>
                d2.models.organisationUnit.get(action.payload.id, {
                    fields: `id,${getDisplayPropertyUrl(
                        d2
                    )},code,address,email,phoneNumber,coordinates,parent[id,${getDisplayPropertyUrl(
                        d2
                    )}],organisationUnitGroups[id,${getDisplayPropertyUrl(
                        d2
                    )}]`,
                })
            )
            .then(setOrgUnit)
    );

export const loadOrgUnitTree = action$ =>
    action$.ofType(types.ORGANISATION_UNIT_TREE_LOAD).concatMap(() =>
        getD2()
            .then(d2 =>
                d2.models.organisationUnits.list({
                    level: 1,
                    fields:
                        'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
                })
            )
            .then(modelCollection =>
                setOrgUnitTree(modelCollection.toArray()[0])
            )
            .catch(errorActionCreator(types.ORGANISATION_UNIT_TREE_LOAD_ERROR))
    );

export const loadOrgUnitLevels = action$ =>
    action$.ofType(types.ORGANISATION_UNIT_LEVELS_LOAD).concatMap(() =>
        getD2()
            .then(async d2 =>
                d2.models.organisationUnitLevels.list({
                    fields: `id,${getDisplayPropertyUrl(d2)},level`,
                    pageing: false,
                })
            )
            .then(levels => setOrgUnitLevels(levels.toArray()))
            .catch(
                errorActionCreator(types.ORGANISATION_UNIT_LEVELS_LOAD_ERROR)
            )
    );

export const loadOrgUnitGroups = action$ =>
    action$.ofType(types.ORGANISATION_UNIT_GROUPS_LOAD).concatMap(() =>
        getD2()
            .then(async d2 =>
                d2.models.organisationUnitGroups.list({
                    fields: `id,${getDisplayPropertyUrl(d2)}`,
                    pageing: false,
                })
            )
            .then(groups => setOrgUnitGroups(groups.toArray()))
            .catch(
                errorActionCreator(types.ORGANISATION_UNIT_GROUPS_LOAD_ERROR)
            )
    );

export const loadOrgUnitGroupSets = action$ =>
    action$.ofType(types.ORGANISATION_UNIT_GROUP_SETS_LOAD).concatMap(() =>
        getD2()
            .then(
                d2 =>
                    console.log &&
                    d2.models.organisationUnitGroupSets.list({
                        fields: `id,${getDisplayPropertyUrl(d2)}`,
                        pageing: false,
                    })
            )
            .then(groupSets => setOrgUnitGroupSets(groupSets.toArray()))
            .catch(
                errorActionCreator(
                    types.ORGANISATION_UNIT_GROUP_SETS_LOAD_ERROR
                )
            )
    );

export const changeOrgUnitCoordinate = action$ =>
    action$
        .ofType(types.ORGANISATION_UNIT_COORDINATE_CHANGE)
        .concatMap(({ layerId, featureId, coordinate }) =>
            apiFetch(`/organisationUnits/${featureId}`, 'PATCH', {
                coordinates: JSON.stringify(coordinate),
            }).then(response => {
                if (response.ok) {
                    return setOrgUnitCoordinate(layerId, featureId, coordinate); // Update org. unit in redux store
                } else {
                    return errorActionCreator(
                        types.ORGANISATION_UNIT_COORDINATE_CHANGE_ERROR
                    );
                }
            })
        );

// Load organisation unit tree path (temporary solution, as favorites don't include paths)
export const loadOrgUnitPath = action$ =>
    action$
        .ofType(types.LAYER_EDIT_ORGANISATION_UNIT_PATH_LOAD)
        .concatMap(action =>
            getD2()
                .then(async d2 =>
                    d2.models.organisationUnit.get(action.id, {
                        fields: 'path',
                    })
                )
                .then(ou => setOrgUnitPath(action.id, ou.path))
                .catch(
                    errorActionCreator(
                        types.LAYER_EDIT_ORGANISATION_UNIT_PATH_LOAD_ERROR
                    )
                )
        );

export default combineEpics(
    loadOrgUnit,
    loadOrgUnitTree,
    loadOrgUnitLevels,
    loadOrgUnitGroups,
    loadOrgUnitGroupSets,
    changeOrgUnitCoordinate,
    loadOrgUnitPath
);
