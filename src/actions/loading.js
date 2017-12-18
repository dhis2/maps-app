import * as types from '../constants/actionTypes';

export const loading = () => ({
    type: types.LOADING,
});

export const loaded = () => ({
    type: types.LOADED,
});