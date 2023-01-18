import { getInstance as getD2 } from 'd2'
import { sortBy } from 'lodash/fp'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import { setPrograms, setProgramIndicators } from '../actions/programs.js'
import * as types from '../constants/actionTypes.js'

export const loadPrograms = (action$) =>
    action$.ofType(types.PROGRAMS_LOAD).concatMap(() =>
        getD2()
            .then((d2) =>
                d2.models.programs.list({
                    fields: 'id,displayName~rename(name),trackedEntityType[id,displayName~rename(name)]',
                    paging: false,
                })
            )
            .then((programs) => setPrograms(programs.toArray()))
            .catch(errorActionCreator(types.PROGRAMS_LOAD_ERROR))
    )

// Load program indicators
export const loadProgramIndicators = (action$) =>
    action$.ofType(types.PROGRAM_INDICATORS_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.program.get(action.programId, {
                    fields: 'programIndicators[dimensionItem~rename(id),displayName~rename(name)]',
                    paging: false,
                })
            )
            .then((program) =>
                setProgramIndicators(
                    action.programId,
                    sortBy('name', program.programIndicators)
                )
            )
            .catch(errorActionCreator(types.PROGRAM_INDICATORS_LOAD_ERROR))
    )

export default combineEpics(loadPrograms, loadProgramIndicators)
