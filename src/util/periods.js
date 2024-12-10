import {
    DAILY,
    WEEKLY,
    WEEKLYWED,
    WEEKLYTHU,
    WEEKLYSAT,
    WEEKLYSUN,
    BIWEEKLY,
    MONTHLY,
    BIMONTHLY,
    QUARTERLY,
    SIXMONTHLY,
    SIXMONTHLYAPR,
    YEARLY,
    FINANCIAL,
    FYNOV,
    FYOCT,
    FYJUL,
    FYAPR,
    getFixedPeriodsOptionsById,
    getRelativePeriodsOptionsById,
    getRelativePeriodsDetails,
    PERIOD_TYPE_REGEX,
} from '@dhis2/analytics'
import {
    periodTypes,
    periodGroups,
    FIXED_PERIODS,
} from '../constants/periods.js'
import { sumObjectValues } from '../util/helpers.js'

const getYearOffsetFromNow = (year) => year - new Date(Date.now()).getFullYear()

const filterPeriods = (periods, firstDate, lastDate) =>
    periods.filter(
        (p) =>
            (!firstDate || p.startDate >= firstDate) &&
            (!lastDate || p.endDate <= lastDate)
    )

export const getPeriodTypes = (includeRelativePeriods, hiddenPeriods = []) =>
    periodTypes(includeRelativePeriods).filter(
        ({ group }) => !hiddenPeriods.includes(group)
    )

export const getFixedPeriodsByType = ({
    periodType,
    year,
    firstDate,
    lastDate,
    periodsSettings,
}) => {
    const period = getFixedPeriodsOptionsById(periodType, periodsSettings)
    const forceDescendingForYearTypes = !!periodType.match(/^FY|YEARLY/)
    const offset = getYearOffsetFromNow(year)

    let periods = period?.getPeriods({ offset, reversePeriods: true })

    if (!periods) {
        return null
    }

    if (firstDate || lastDate) {
        periods = filterPeriods(periods, firstDate, lastDate)
    }

    // TODO: the reverse() is a workaround for a bug in the analytics
    // getPeriods function that no longer correctly reverses the order
    // for YEARLY and FY period types
    return forceDescendingForYearTypes ? periods.reverse() : periods
}

export const getRelativePeriods = (hiddenPeriods = []) =>
    periodGroups
        .filter((id) => !hiddenPeriods.includes(id))
        .map((id) => getRelativePeriodsOptionsById(id).getPeriods())
        .flat()

export const isPeriodAvailable = (id, hiddenPeriods) =>
    !!getRelativePeriods(hiddenPeriods).find((p) => p.id === id)

// All period names
export const getPeriodNames = () => ({
    ...getPeriodTypes().reduce((obj, { id, name }) => {
        obj[id] = name
        return obj
    }, {}),
    ...getRelativePeriods().reduce((obj, { id, name }) => {
        obj[id] = name
        return obj
    }, {}),
})

export const filterFuturePeriods = (periods, date) => {
    const now = new Date(date || Date.now())
    return periods.filter(({ startDate }) => new Date(startDate) < now)
}

const periodSetting = /keyHide(.*)Periods/

export const getHiddenPeriods = (systemSettings) => {
    return Object.keys(systemSettings)
        .filter(
            (setting) => periodSetting.test(setting) && systemSettings[setting]
        )
        .map((setting) => setting.match(periodSetting)[1].toUpperCase())
}

// Count maximum number of periods returned by analytics api
// Preliminary step
export const getPeriodsDurationByType = (
    periods,
    periodsDetails,
    deduplication = true
) => {
    if (!deduplication) {
        return periods.reduce((acc, { id }) => {
            acc[id] = acc[id] || {}
            acc[id].any = periodsDetails[id]?.duration || 1
            return acc
        }, {})
    } else {
        return periods.reduce((acc, { id }) => {
            const {
                type = FIXED_PERIODS,
                offset = 0,
                duration = 1,
            } = periodsDetails[id] || {}

            acc[type] = acc[type] || { first: 0, last: 0 }

            if (type === FIXED_PERIODS && !periodsDetails[id]) {
                acc[type].any = (acc[type].any || 0) + 1
            } else {
                acc[type].first = Math.max(acc[type].first, 1 + offset)
                acc[type].last = Math.max(
                    acc[type].last,
                    duration - (1 + offset)
                )
            }
            return acc
        }, {})
    }
}
// Total count
export const countPeriods = (periods, deduplication) => {
    const periodsDetails = getRelativePeriodsDetails()
    const periodsDurationByType = getPeriodsDurationByType(
        periods,
        periodsDetails,
        deduplication
    )
    return sumObjectValues(periodsDurationByType)
}

export const getPeriodTypeFromId = (periodId) => {
    return Object.keys(PERIOD_TYPE_REGEX).find((type) =>
        periodId.match(PERIOD_TYPE_REGEX[type])
    )
}

export const getPeriodLevelFromPeriodType = (periodType) => {
    switch (periodType) {
        case DAILY:
            return 0
        case WEEKLY:
        case WEEKLYWED:
        case WEEKLYTHU:
        case WEEKLYSAT:
        case WEEKLYSUN:
            return 1
        case BIWEEKLY:
            return 2
        case MONTHLY:
            return 3
        case BIMONTHLY:
            return 4
        case QUARTERLY:
            return 5
        case SIXMONTHLY:
        case SIXMONTHLYAPR:
            return 6
        case YEARLY:
        case FYNOV:
        case FYOCT:
        case FYJUL:
        case FYAPR:
            return 7
        default:
            return 8
    }
}
