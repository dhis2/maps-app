import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import sortBy from 'lodash/fp/sortBy';
import * as types from '../constants/actionTypes';
import { setDataElementGroups, setDataElements, setDataElementOperands } from '../actions/dataElements';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

// Load all data element groups
export const loadDataElementGroups = (action$) =>
    action$
        .ofType(types.DATA_ELEMENT_GROUPS_LOAD)
        .concatMap(() =>
            getD2()
                .then(d2 => d2.models.dataElementGroups.list({
                    fields: `id,${getDisplayPropertyUrl()}`,
                    paging: false,
                }))
                .then(groups => setDataElementGroups(sortBy('name', groups.toArray())))
                .catch(errorActionCreator(types.PROGRAMS_LOAD_ERROR))
        );

// Load data elements in one group
export const loadDataElements = (action$) =>
    action$
        .ofType(types.DATA_ELEMENTS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => {
                    // TODO: Load data elements not belonging to a group
                    return d2.models.dataElement
                        .filter().on('dataElementGroups.id').equals(action.groupId)
                        .list({
                            fields: `dimensionItem~rename(id),${getDisplayPropertyUrl(d2)}`,
                            domainType: 'aggregate',
                            paging: false,
                        });
                    })
                .then(dataElements => setDataElements(action.groupId, dataElements.toArray()))
                .catch(errorActionCreator(types.DATA_ELEMENTS_LOAD_ERROR))
        );

// Load data element operands in one group
export const loadDataElementOperands = (action$) =>
    action$
        .ofType(types.DATA_ELEMENT_OPERANDS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => {
                    console.log('d2.models', d2.models, d2.models.dataElementOperand);
                    // TODO: Load data element operands not belonging to a group
                    return d2.models.dataElementOperand
                        .filter().on('dataElementGroups.id').equals(action.groupId)
                        .list({
                            fields: `id,${getDisplayPropertyUrl(d2)}`,
                            paging: false,
                        });
                })
                .then(dataElementOperands => setDataElementOperands(action.groupId, dataElementOperands.toArray()))
                .catch(errorActionCreator(types.DATA_ELEMENT_OPERANDS_LOAD_ERROR))
        );

export default combineEpics(loadDataElementGroups, loadDataElements, loadDataElementOperands);
