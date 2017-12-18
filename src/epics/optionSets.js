import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { addOptionSet } from '../actions/optionSets';
import { errorActionCreator } from '../actions/helpers';

// Load option set
export const loadOptionSet = (action$) =>
    action$
        .ofType(types.OPTION_SET_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.optionSets.get(action.id, {
                    fields: 'id,displayName~rename(name),version,options[code,displayName~rename(name)]',
                    paging: false,
                }))
                .then(optionSet => addOptionSet(optionSet))
                .catch(errorActionCreator(types.OPTION_SET_LOAD_ERROR))
        );

export default combineEpics(loadOptionSet);
