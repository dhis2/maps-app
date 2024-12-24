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

// Count number of periods returned by analytics api (maximum ie. at some point fixed and relative periods will not overlap anymore)
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

// Get period level as index of ordered array
const getPeriodLevelFromPeriodType = (periodType) => {
    const periodTypesByLevel = [
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
    ]
    return periodTypesByLevel.indexOf(periodType)
}

// Get distinct levels from an array of periods
const getDistinctLevels = (periodsWithLevel) =>
    [...new Set(periodsWithLevel.map((item) => item.level))].sort(
        (a, b) => b - a
    )

// Add type, level and levelRank to period object
export const addPeriodsDetails = (periods) => {
    const periodsWithTypeAndLevel = periods.map((period) => {
        const type = getPeriodTypeFromId(period.id)
        const level = getPeriodLevelFromPeriodType(type)
        return { ...period, type, level }
    })
    const distinctLevels = getDistinctLevels(periodsWithTypeAndLevel)
    const distinctLevelsCount = distinctLevels.length
    const periodsWithTypeLevelAndRank = periodsWithTypeAndLevel.map(
        (period) => ({
            ...period,
            levelRank: distinctLevels.indexOf(period.level),
        })
    )
    return {
        periodsWithTypeLevelAndRank,
        distinctLevelsCount,
    }
}

export const sortPeriodsByLevelAndStartDate = (periods) => {
    if (!periods) {
        return []
    }
    return periods
        .sort((a, b) => b.level - a.level)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
}

export const getMinMaxDates = (periods = []) => {
    if (!periods.length) {
        return [null, null]
    }

    return periods.reduce(
        (acc, { startDate, endDate }) => {
            const start = new Date(startDate)
            const end = new Date(endDate)
            return [
                start < acc[0] ? start : acc[0],
                end > acc[1] ? end : acc[1],
            ]
        },
        [new Date(periods[0].startDate), new Date(periods[0].endDate)]
    )
}

export const checkLastPeriod = (currentPeriod, sortedPeriods) => {
    const currentIndex = sortedPeriods.findIndex(
        (p) => p.id === currentPeriod.id
    )
    return currentIndex === sortedPeriods.length - 1
}
