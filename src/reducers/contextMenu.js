import * as types from '../constants/actionTypes.js'

const contextMenu = (state = null, action) => {
    switch (action.type) {
        case types.MAP_CONTEXT_MENU_OPEN:
            console.log('MAP_CONTEXT_MENU_OPEN', action.payload)
            return action.payload

        case types.MAP_CONTEXT_MENU_CLOSE:
            return null

        default:
            return state
    }
}

export default contextMenu
