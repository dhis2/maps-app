import { setOrgUnits } from '../../../actions/layerEdit.js'
import {
    initializePeriodType,
    initializePeriods,
} from '../shared/initializePeriod.js'

const initializeOrgUnits = (dispatch, { rows, orgUnits }) => {
    if (rows) {
        return
    }
    if (orgUnits?.roots) {
        dispatch(
            setOrgUnits({
                dimension: 'ou',
                items: orgUnits.roots,
            })
        )
    }
}

export const initializeEventLayer = (params) => (dispatch) => {
    // Period
    initializePeriodType(dispatch, params)
    initializePeriods(dispatch, params)
    // OrgUnits
    initializeOrgUnits(dispatch, params)
}
