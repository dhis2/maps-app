import {
    getFixedPeriodsOptionsById,
    getRelativePeriodsOptionsById,
} from '@dhis2/analytics'
import { periodTypes, periodGroups } from '../constants/periods.js'

const getYearOffsetFromNow = (year) => year - new Date(Date.now()).getFullYear()

export const getPeriodTypes = (hiddenPeriods = []) =>
    periodTypes().filter(({ group }) => !hiddenPeriods.includes(group))

export const getFixedPeriodsByType = (periodType, year, periodsSettings) => {
    const period = getFixedPeriodsOptionsById(periodType, periodsSettings)
    const forceDescendingForYearTypes = !!periodType.match(/^FY|YEARLY/)
    const offset = getYearOffsetFromNow(year)

    const periods = period?.getPeriods({ offset, reversePeriods: true }) || null
    if (periods && forceDescendingForYearTypes) {
        // TODO: the reverse() is a workaround for a bug in the analytics
        // getPeriods function that no longer correctly reverses the order
        // for YEARLY and FY period types
        return periods.reverse()
    }
    return periods
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

const periodSetting = /keyHide(.*)Periods/

export const getHiddenPeriods = (systemSettings) => {
    return Object.keys(systemSettings)
        .filter(
            (setting) => periodSetting.test(setting) && systemSettings[setting]
        )
        .map((setting) => setting.match(periodSetting)[1].toUpperCase())
}
