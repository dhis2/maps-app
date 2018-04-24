import * as types from '../constants/actionTypes';

export const toggleExpand = () => ({
    type: types.INTERPRETATIONS_TOGGLE_EXPAND,
});

export const openInterpretationDialog = interpretation => ({
    type: types.INTERPRETATIONS_OPEN_WRITE_DIALOG,
    interpretation,
});

export const closeInterpretationDialog = () => ({
    type: types.INTERPRETATIONS_CLOSE_WRITE_DIALOG,
});

export const setInterpretations = (interpretations) => ({
    type: types.INTERPRETATIONS_SET,
    interpretations,
});

export const loadInterpretations = () => ({
    type: types.INTERPRETATIONS_LOAD,
});

export const setCurrentInterpretation = (interpretationId) => ({
    type: types.INTERPRETATIONS_SET_CURRENT,
    interpretationId,
});

export const saveInterpretationLike = (interpretation, value) => ({
    type: types.INTERPRETATIONS_SAVE_LIKE_VALUE,
    interpretation,
    value,
});

export const saveInterpretation = (interpretation) => ({
    type: types.INTERPRETATIONS_SAVE,
    interpretation,
});

export const addInterpretation = (interpretation) => ({
    type: types.INTERPRETATIONS_ADD,
    interpretation,
});

export const deleteInterpretation = (interpretation) => ({
    type: types.INTERPRETATIONS_DELETE,
    interpretation,
});

export const saveComment = (interpretation, comment) => ({
    type: types.INTERPRETATIONS_SAVE_COMMENT,
    interpretation,
    comment,
});

export const deleteComment = (interpretation, comment) => ({
    type: types.INTERPRETATIONS_DELETE_COMMENT,
    interpretation,
    comment,
});
