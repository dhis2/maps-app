import * as types from '../constants/actionTypes.js'

// Set all programs
export const setPrograms = (data) => ({
    type: types.PROGRAMS_SET,
    payload: data,
})

// Set program indicators for one program
export const setProgramIndicators = (programId, payload) => ({
    type: types.PROGRAM_INDICATORS_SET,
    programId,
    payload,
})

// Load all programs
export const loadPrograms = () => ({
    type: types.PROGRAMS_LOAD,
})

// Load all indicators for one program
export const loadProgramIndicators = (programId) => ({
    type: types.PROGRAM_INDICATORS_LOAD,
    programId,
})
