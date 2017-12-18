import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { setDataSets } from '../actions/dataSets';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

// Load data sets
export const loadDataSets = (action$) =>
    action$
        .ofType(types.DATA_SETS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.dataSets.list({
                    fields: `dimensionItem~rename(id),${getDisplayPropertyUrl()}`,
                    paging: false,
                }))
                .then(dataSets => setDataSets(dataSets.toArray()))
                .catch(errorActionCreator(types.DATA_SETS_LOAD_ERROR))
        );

export default combineEpics(loadDataSets);
