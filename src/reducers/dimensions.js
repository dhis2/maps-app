import * as types from '../constants/actionTypes.js'

const dimensions = (state = null, action) => {
    switch (action.type) {
        case types.DIMENSIONS_SET:
            return action.payload

        case types.DIMENSION_ITEMS_SET:
            return state.map((dim) =>
                dim.id === action.dimensionId
                    ? {
                          ...dim,
                          items: action.payload,
                      }
                    : dim
            )

        default:
            return state
    }
}

export default dimensions
