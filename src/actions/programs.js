import * as types from '../constants/actionTypes.js'

// Set program indicators for one program
export const setProgramIndicators = (programId, payload) => ({
    type: types.PROGRAM_INDICATORS_SET,
    programId,
    payload,
})

// Load all indicators for one program
export const loadProgramIndicators = (programId) => ({
    type: types.PROGRAM_INDICATORS_LOAD,
    programId,
})
