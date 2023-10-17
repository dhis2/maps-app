import * as types from '../constants/actionTypes.js'

const test = {
    id: 'FLjwMPWLrL2',
    name: 'Freetown',
    geometry: {
        type: 'Point',
        coordinates: [-13.234444, 8.484444],
    },
}

const climate = (state = test, action) => {
    switch (action.type) {
        case types.CLIMATE_PANEL_OPEN:
            return { ...action.payload }

        case types.CLIMATE_PANEL_CLOSE:
            return null

        default:
            return state
    }
}

export default climate
