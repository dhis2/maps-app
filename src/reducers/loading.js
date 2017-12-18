import * as types from '../constants/actionTypes';

export default function loading(state = false, action) {
    switch (action.type) {
        case types.LOADING:
            return true;
        case types.LOADED:
            return false;
        default:
            return state;
    }
}