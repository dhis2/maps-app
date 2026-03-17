import { getRelativePeriodsName } from '@dhis2/analytics'
import {
    setOrgUnits,
    setPeriods,
    setBackupPeriodsDates,
    setEventStatus,
    setPeriodType,
    setRenderingStrategy,
} from '../../../actions/layerEdit.js'
import { EVENT_STATUS_ALL } from '../../../constants/eventStatuses.js'
import { DEFAULT_ORG_UNIT_LEVEL } from '../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { isPeriodAvailable } from '../../../util/periods.js'

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

const initializePeriodType = (dispatch, { periodType, startDate, endDate }) => {
    if (periodType) {
        return
    }
    const hasDate = startDate !== undefined && endDate !== undefined
    dispatch(
        setPeriodType(
            { value: hasDate ? START_END_DATES : PREDEFINED_PERIODS },
            !hasDate
        )
    )
}

const getDefaultPeriods = (systemSettings) => {
    const { keyAnalysisRelativePeriod: defaultPeriod, hiddenPeriods } =
        systemSettings || {}
    if (!isPeriodAvailable(defaultPeriod, hiddenPeriods)) {
        return undefined
    }
    return [
        { id: defaultPeriod, name: getRelativePeriodsName()[defaultPeriod] },
    ]
}

const initializePeriods = (
    dispatch,
    {
        filters,
        startDate,
        endDate,
        renderingStrategy,
        defaultRenderingStrategy,
        systemSettings,
        syncFromOtherLayers,
    }
) => {
    if (filters || (startDate !== undefined && endDate !== undefined)) {
        return
    }

    const defaultPeriods = getDefaultPeriods(systemSettings)

    if (
        syncFromOtherLayers({
            renderingStrategy: renderingStrategy || defaultRenderingStrategy,
        })
    ) {
        dispatch(
            setBackupPeriodsDates({
                type: PREDEFINED_PERIODS,
                periods: defaultPeriods || [],
                ...getDefaultDatesInCalendar(),
            })
        )
    } else {
        dispatch(
            setBackupPeriodsDates({
                type: START_END_DATES,
                ...getDefaultDatesInCalendar(),
            })
        )
        dispatch(setPeriods(defaultPeriods || []))
    }
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
