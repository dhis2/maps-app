import { getInstance as getD2 } from 'd2'
import { combineEpics } from 'redux-observable'
import { errorActionCreator } from '../actions/helpers.js'
import { setIndicators } from '../actions/indicators.js'
import * as types from '../constants/actionTypes.js'

export const loadIndicators = (action$) =>
    action$.ofType(types.INDICATORS_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.indicators
                    .filter()
                    .on('indicatorGroups.id')
                    .equals(action.groupId)
                    .list({
                        fields: 'id,displayName~rename(name),legendSet[id]',
                        paging: false,
                    })
            )
            .then((indicators) =>
                setIndicators(action.groupId, indicators.toArray())
            )
            .catch(errorActionCreator(types.INDICATORS_LOAD_ERROR))
    )

/*    
export const loadIndicatorGroups = (action$) =>
    action$.ofType(types.INDICATOR_GROUPS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.indicatorGroups.list({
                    fields: 'id,displayName~rename(name)',
                    paging: false,
                })
            )
            .then((indicatorGroups) =>
                setIndicatorGroups(indicatorGroups.toArray())
            )
            .catch(errorActionCreator(types.INDICATOR_GROUPS_LOAD_ERROR))
    )
*/

export default combineEpics(loadIndicators)
