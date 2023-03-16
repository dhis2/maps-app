import {
    getFixedPeriodsOptionsById,
    getRelativePeriodsOptionsById,
} from '@dhis2/analytics'
import { periodTypes, periodGroups } from '../constants/periods.js'

const getYearOffsetFromNow = (year) => year - new Date(Date.now()).getFullYear()

export const getPeriodTypes = (hiddenPeriods = []) =>
    periodTypes().filter(({ group }) => !hiddenPeriods.includes(group))

export const getFixedPeriodsByType = (periodType, year) => {
    const period = getFixedPeriodsOptionsById(periodType)
    const offset = getYearOffsetFromNow(year)

    // TODO: the reverse() is a workaround for a bug in the analytics
    // getPeriods function that no longer correctly reverses the order
    return period
        ? period.getPeriods({ offset, reversePeriods: true }).reverse()
        : null
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

export const filterFuturePeriods = (periods) => {
    const now = new Date(Date.now())
    return periods.filter(({ startDate }) => new Date(startDate) < now)
}
