import * as types from '../constants/actionTypes.js'

// Set all programs
export const setPrograms = (data) => ({
    type: types.PROGRAMS_SET,
    payload: data,
})

// Set tracked entity attributes for one program
export const setProgramAttributes = (programId, payload) => ({
    type: types.PROGRAM_ATTRIBUTES_SET,
    programId,
    payload,
})

// Set data elements for one program
export const setProgramDataElements = (programId, payload) => ({
    type: types.PROGRAM_DATA_ELEMENTS_SET,
    programId,
    payload,
})

// Set program indicators for one program
export const setProgramIndicators = (programId, payload) => ({
    type: types.PROGRAM_INDICATORS_SET,
    programId,
    payload,
})

// Set data elements for one program stage
export const setProgramStageDataElements = (programStageId, payload) => ({
    type: types.PROGRAM_STAGE_DATA_ELEMENTS_SET,
    programStageId,
    payload,
})

// Load all programs
export const loadPrograms = () => ({
    type: types.PROGRAMS_LOAD,
})

// Load program data elements
export const loadProgramDataElements = (programId) => ({
    type: types.PROGRAM_DATA_ELEMENTS_LOAD,
    programId,
})

// Load all indicators for one program
export const loadProgramIndicators = (programId) => ({
    type: types.PROGRAM_INDICATORS_LOAD,
    programId,
})

// Load program tracked entity attributes
export const loadProgramTrackedEntityAttributes = (programId) => ({
    type: types.PROGRAM_ATTRIBUTES_LOAD,
    programId,
})

// Load program stage data elements
export const loadProgramStageDataElements = (programStageId) => ({
    type: types.PROGRAM_STAGE_DATA_ELEMENTS_LOAD,
    programStageId,
})
