import * as types from '../constants/actionTypes.js'

const test = {
    id: 'FLjwMPWLrL2',
    name: 'Baomahun CHC',
    geometry: {
        type: 'Point',
        coordinates: [-11.667823791503906, 8.41633815756606],
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
