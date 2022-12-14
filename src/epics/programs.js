import { getInstance as getD2 } from 'd2'
import { sortBy } from 'lodash/fp'
import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { errorActionCreator } from '../actions/helpers.js'
import {
    setPrograms,
    setProgramStages,
    setProgramAttributes,
    setProgramDataElements,
    setProgramIndicators,
    setProgramStageDataElements,
} from '../actions/programs.js'
import * as types from '../constants/actionTypes.js'
import { apiFetch } from '../util/api.js'
import { getDisplayPropertyUrl, getValidDataItems } from '../util/helpers.js'

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

// Load program stages
export const loadProgramStages = (action$) =>
    action$.ofType(types.PROGRAM_STAGES_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.program.get(action.programId, {
                    fields: 'programStages[id,displayName~rename(name)]',
                    paging: false,
                })
            )
            .then((program) =>
                setProgramStages(
                    action.programId,
                    program.programStages.toArray()
                )
            )
            .catch(errorActionCreator(types.PROGRAM_STAGES_LOAD_ERROR))
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

// Load program tracked entity attributes
export const loadProgramTrackedEntityAttributes = (action$) =>
    action$.ofType(types.PROGRAM_ATTRIBUTES_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.program.get(action.programId, {
                    fields: 'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName~rename(name),valueType,optionSet[id,displayName~rename(name)],legendSet]]',
                    paging: false,
                })
            )
            .then((program) =>
                program.programTrackedEntityAttributes.map(
                    (d) => d.trackedEntityAttribute
                )
            )
            .then(getValidDataItems)
            .then((attributes) =>
                setProgramAttributes(action.programId, attributes)
            )
            .catch(errorActionCreator(types.PROGRAM_ATTRIBUTES_LOAD_ERROR))
    )

// Load program data elements
export const loadProgramDataElements = (action$) =>
    action$.ofType(types.PROGRAM_DATA_ELEMENTS_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                apiFetch(
                    `/programDataElements?program=${
                        action.programId
                    }&fields=dimensionItem~rename(id),${getDisplayPropertyUrl(
                        d2
                    )},valueType,legendSet&paging=false`
                )
            )
            .then((data) =>
                setProgramDataElements(
                    action.programId,
                    data.programDataElements
                )
            )
    )

// Load program stage data elements
export const loadProgramStageDataElements = (action$) =>
    action$.ofType(types.PROGRAM_STAGE_DATA_ELEMENTS_LOAD).concatMap((action) =>
        getD2()
            .then((d2) =>
                d2.models.programStage.get(action.programStageId, {
                    fields: `programStageDataElements[dataElement[id,${getDisplayPropertyUrl(
                        d2
                    )},valueType,optionSet[id,displayName~rename(name)],legendSet]]`,
                    paging: false,
                })
            )
            .then((programStage) =>
                programStage.programStageDataElements.map((d) => d.dataElement)
            )
            .then(getValidDataItems)
            .then((dataElements) =>
                setProgramStageDataElements(action.programStageId, dataElements)
            )
            .catch(
                errorActionCreator(types.PROGRAM_STAGE_DATA_ELEMENTS_LOAD_ERROR)
            )
    )

export default combineEpics(
    loadPrograms,
    loadProgramStages,
    loadProgramIndicators,
    loadProgramTrackedEntityAttributes,
    loadProgramDataElements,
    loadProgramStageDataElements
)
