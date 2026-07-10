import { getRelativePeriodsName } from '@dhis2/analytics'
import {
    setPeriods,
    setBackupPeriodsDates,
    setPeriodType,
} from '../../../actions/layerEdit.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import { getPeriodsFromFilters } from '../../../util/analytics.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { isPeriodAvailable } from '../../../util/periods.js'

export const initializePeriodType = (
    dispatch,
    { periodType, filters, startDate, endDate }
) => {
    if (periodType) {
        return
    }
    // Saved period takes priority over leftover start/end dates
    const hasPeriod = getPeriodsFromFilters(filters).length > 0
    const useDates =
        !hasPeriod && startDate !== undefined && endDate !== undefined
    dispatch(
        setPeriodType(
            { value: useDates ? START_END_DATES : PREDEFINED_PERIODS },
            !useDates
        )
    )
}

export const getDefaultPeriods = (systemSettings) => {
    const { keyAnalysisRelativePeriod: defaultPeriod, hiddenPeriods } =
        systemSettings || {}
    if (!isPeriodAvailable(defaultPeriod, hiddenPeriods)) {
        return undefined
    }
    return [
        { id: defaultPeriod, name: getRelativePeriodsName()[defaultPeriod] },
    ]
}

export const initializePeriods = (
    dispatch,
    {
        filters,
        startDate,
        endDate,
        renderingStrategy,
        defaultRenderingStrategy,
        systemSettings,
        syncFromOtherLayers,
        shouldSyncFromOtherLayers,
    }
) => {
    if (filters || (startDate !== undefined && endDate !== undefined)) {
        return
    }

    const defaultPeriods = getDefaultPeriods(systemSettings)

    if (
        shouldSyncFromOtherLayers &&
        syncFromOtherLayers?.({
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
