import {
    setOrgUnits,
    setEventStatus,
    setRenderingStrategy,
} from '../../../actions/layerEdit.js'
import { EVENT_STATUS_ALL } from '../../../constants/eventStatuses.js'
import { DEFAULT_ORG_UNIT_LEVEL } from '../../../constants/layers.js'
import {
    initializePeriodType,
    initializePeriods,
} from '../shared/initializePeriod.js'

const initializeEventStatus = (dispatch, { eventStatus }) => {
    if (eventStatus) {
        return
    }
    dispatch(setEventStatus(EVENT_STATUS_ALL))
}

const initializeRenderingStrategy = (
    dispatch,
    { renderingStrategy, defaultRenderingStrategy }
) => {
    if (renderingStrategy) {
        return
    }
    dispatch(setRenderingStrategy(defaultRenderingStrategy))
}

const initializeOrgUnits = (dispatch, { rows, orgUnits }) => {
    if (rows) {
        return
    }
    const defaultLevel = orgUnits?.levels?.[DEFAULT_ORG_UNIT_LEVEL]
    if (defaultLevel) {
        dispatch(
            setOrgUnits({
                dimension: 'ou',
                items: [
                    { id: `LEVEL-${defaultLevel.id}`, name: defaultLevel.name },
                ],
            })
        )
    }
}

export const initializeThematicLayer = (params) => (dispatch) => {
    // Data
    initializeEventStatus(dispatch, params)
    // Period
    initializeRenderingStrategy(dispatch, params)
    initializePeriodType(dispatch, params)
    initializePeriods(dispatch, params)
    // OrgUnits
    initializeOrgUnits(dispatch, params)
}
