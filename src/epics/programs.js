import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import sortBy from 'lodash/fp/sortBy';
import * as types from '../constants/actionTypes';
import { setPrograms, setProgramStages, setProgramAttributes, setProgramIndicators, setProgramStageDataElements } from '../actions/programs';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

export const loadPrograms = (action$) =>
    action$
        .ofType(types.PROGRAMS_LOAD)
        .concatMap(() =>
            getD2()
                .then(d2 => d2.models.programs.list({
                    fields: 'id,displayName~rename(name)',
                    paging: false,
                }))
                .then(programs => setPrograms(programs.toArray()))
                .catch(errorActionCreator(types.PROGRAMS_LOAD_ERROR))
        );

// Load program stages
export const loadProgramStages = (action$) =>
    action$
        .ofType(types.PROGRAM_STAGES_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.program.get(action.programId, {
                    fields: 'programStages[id,displayName~rename(name)]',
                    paging: false,
                }))
                .then(program => setProgramStages(action.programId, program.programStages.toArray()))
                .catch(errorActionCreator(types.PROGRAM_STAGES_LOAD_ERROR))
        );

// Load program indicators
export const loadProgramIndicators = (action$) =>
    action$
        .ofType(types.PROGRAM_INDICATORS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.program.get(action.programId, {
                    fields: 'programIndicators[dimensionItem~rename(id),displayName~rename(name)]',
                    paging: false,
                }))
                .then(program => setProgramIndicators(action.programId, sortBy('name', program.programIndicators)))
                .catch(errorActionCreator(types.PROGRAM_INDICATORS_LOAD_ERROR))
        );

// Load program tracked entity attributes
export const loadProgramTrackedEntityAttributes = (action$) =>
    action$
        .ofType(types.PROGRAM_ATTRIBUTES_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.program.get(action.programId, {
                    fields: 'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName~rename(name),valueType,optionSet[id,displayName~rename(name)]]]',
                    paging: false,
                }))
                .then(program => setProgramAttributes(action.programId, program.programTrackedEntityAttributes.map(d => d.trackedEntityAttribute)))
                .catch(errorActionCreator(types.PROGRAM_ATTRIBUTES_LOAD_ERROR))
        );

// Load program stage data elements
export const loadProgramStageDataElements = (action$) =>
    action$
        .ofType(types.PROGRAM_STAGE_DATA_ELEMENTS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => d2.models.programStage.get(action.programStageId, {
                    fields: `programStageDataElements[dataElement[id,${getDisplayPropertyUrl()},valueType,optionSet[id,displayName~rename(name)]]]`,
                    paging: false,
                }))
                .then(programStage => programStage.programStageDataElements.map(d => d.dataElement))
                .then(dataElements => setProgramStageDataElements(action.programStageId, dataElements))
                .catch(errorActionCreator(types.PROGRAM_STAGE_DATA_ELEMENTS_LOAD_ERROR))
        );

export default combineEpics(loadPrograms, loadProgramStages, loadProgramIndicators, loadProgramTrackedEntityAttributes, loadProgramStageDataElements);
