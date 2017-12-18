import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { setLegendSets } from '../actions/legendSets';
import { errorActionCreator } from '../actions/helpers';

// Load data sets
export const loadLegendSets = (action$) =>
    action$
        .ofType(types.LEGEND_SETS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.legendSets.list({
                    fields: 'id,displayName~rename(name)',
                    paging: false,
                }))
                .then(legendSets => setLegendSets(legendSets.toArray()))
                .catch(errorActionCreator(types.LEGEND_SETS_LOAD_ERROR))
        );

export default combineEpics(loadLegendSets);

