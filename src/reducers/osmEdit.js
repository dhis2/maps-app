import * as types from '../constants/actionTypes.js'

const defaultState = {
    drawing: null,
    form: null,
}

const osmEdit = (state = defaultState, action) => {
    switch (action.type) {
        case types.OSM_DRAWING_START:
            return { drawing: action.payload, form: null }

        case types.OSM_FEATURE_FORM_OPEN:
            return { drawing: null, form: action.payload }

        case types.OSM_EDIT_CLOSE:
            return defaultState

        default:
            return state
    }
}

export default osmEdit
