import * as types from '../constants/actionTypes.js'

const dataTable = (state = null, action) => {
    switch (action.type) {
        case types.DATA_TABLE_CLOSE:
        case types.MAP_NEW:
        case types.MAP_SET:
        case types.DOWNLOAD_MODE_CLOSE:
        case types.DOWNLOAD_MODE_OPEN:
            return null

        case types.DATA_TABLE_TOGGLE:
            return state === action.id ? null : action.id

        case types.LAYER_REMOVE:
            return state === action.id ? null : state

        default:
            return state
    }
}

export default dataTable
