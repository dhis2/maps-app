import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { setOrgUnitTree, setOrgUnitLevels, setOrgUnitGroups, setOrgUnitGroupSets } from '../actions/orgUnits';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

export const loadOrgUnitTree = (action$) =>
    action$
        .ofType(types.ORGANISATION_UNIT_TREE_LOAD)
        .concatMap(() =>
            getD2()
                .then((d2) => d2.models.organisationUnits.list({
                    level: 1,
                    fields: 'id,path,displayName,children[id,path,displayName,children::isNotEmpty]'
                }))
                .then(modelCollection => setOrgUnitTree(modelCollection.toArray()[0]))
                .catch(errorActionCreator(types.ORGANISATION_UNIT_TREE_LOAD_ERROR))
        );

export const loadOrgUnitLevels = (action$) =>
    action$
        .ofType(types.ORGANISATION_UNIT_LEVELS_LOAD)
        .concatMap(() =>
            getD2()
                .then((d2) => d2.models.organisationUnitLevels.list({
                    fields: `id,${getDisplayPropertyUrl()},level`,
                    pageing: false,
                }))
                .then(levels => setOrgUnitLevels(levels.toArray()))
                .catch(errorActionCreator(types.ORGANISATION_UNIT_LEVELS_LOAD_ERROR))
        );

export const loadOrgUnitGroups = (action$) =>
    action$
        .ofType(types.ORGANISATION_UNIT_GROUPS_LOAD)
        .concatMap(() =>
            getD2()
                .then((d2) => d2.models.organisationUnitGroups.list({
                    fields: `id,${getDisplayPropertyUrl()}`,
                    pageing: false,
                }))
                .then(groups => setOrgUnitGroups(groups.toArray()))
                .catch(errorActionCreator(types.ORGANISATION_UNIT_GROUPS_LOAD_ERROR))
        );

export const loadOrgUnitGroupSets = (action$) =>
    action$
        .ofType(types.ORGANISATION_UNIT_GROUP_SETS_LOAD)
        .concatMap(() =>
            getD2()
                .then((d2) => console.log && d2.models.organisationUnitGroupSets.list({
                    fields: `id,${getDisplayPropertyUrl()}`,
                    pageing: false,
                }))
                .then(groupSets => setOrgUnitGroupSets(groupSets.toArray()))
                .catch(errorActionCreator(types.ORGANISATION_UNIT_GROUP_SETS_LOAD_ERROR))
        );

export default combineEpics(loadOrgUnitTree, loadOrgUnitLevels, loadOrgUnitGroups, loadOrgUnitGroupSets);
