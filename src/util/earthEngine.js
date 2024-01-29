import i18n from '@dhis2/d2-i18n'
import { loadEarthEngineWorker } from '../components/map/MapApi.js'
import { apiFetch } from './api.js'
import { formatDate, formatStartEndDate, incrementDate } from './time.js'

export const classAggregation = ['percentage', 'hectares', 'acres']

export const hasClasses = (type) => classAggregation.includes(type)

const timeRangeCache = {}

// Translates from dynamic to static filters
export const translateFilters = (filters, ...args) =>
    filters.map((filter) => ({
        ...filter,
        arguments: filter.arguments.map((arg) => {
            const match = arg.match(/^\$([0-9]+)$/)
            return match ? args[match[1] - 1] : arg
        }),
    }))

export const getStartEndDate = (data) =>
    formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'], // - 7200001, // Minus 2 hrs to end the day before
        null,
        false
    )

const getMonth = (data) => {
    const date = new Date(data['system:time_start'])
    const month = date.toLocaleString('default', { month: 'long' }) // TODO: i18n?
    const year = date.getFullYear()
    return `${month} ${year}`
}

export const getFilterFromPeriod = (period, filters) => {
    if (!period || !filters) {
        return
    }

    const { id, startDate, endDate } = period

    if (startDate && endDate) {
        return translateFilters(filters, startDate, incrementDate(endDate))
    } else {
        return translateFilters(filters, id)
    }
}

export const getPeriodFromFilter = (filter) => {
    if (!Array.isArray(filter) || !filter.length) {
        return null
    }

    const { id, name, year, arguments: args } = filter[0]
    let periodId = id || args[1]

    // Remover non-digits from periodId (needed for backward compatibility for population layers saved before 2.41)
    if (nonDigits.test(periodId)) {
        periodId = Number(periodId.replace(nonDigits, '')) // Remove non-digits
    }

    return {
        id: periodId,
        name,
        year,
    }
}

// Returns period name from filter
export const getPeriodNameFromFilter = (filter) => {
    const period = getPeriodFromFilter(filter)

    if (!period) {
        return null
    }

    const { name, year } = period
    const showYear = year && String(year) !== name

    return `${name}${showYear ? ` ${year}` : ''}`
}

// Returns auth token for EE API as a promise
/* eslint-disable no-async-promise-executor */
export const getAuthToken = () =>
    new Promise(async (resolve, reject) => {
        const token = await apiFetch('/tokens/google').catch(() =>
            reject(
                new Error(
                    i18n.t(
                        'Cannot get authorization token for Google Earth Engine.'
                    )
                )
            )
        )

        if (token && token.status === 'ERROR') {
            reject(
                new Error(
                    i18n.t(
                        'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.'
                    )
                )
            )
        }

        resolve({
            token_type: 'Bearer',
            ...token,
        })
    })
/* eslint-enable no-async-promise-executor */

let workerPromise

// Load EE worker and set token
const getWorkerInstance = async () => {
    workerPromise =
        workerPromise ||
        (async () => {
            const EarthEngineWorker = await loadEarthEngineWorker(getAuthToken)
            return await new EarthEngineWorker()
        })()

    return workerPromise
}

export const getPeriods = async (eeId, periodType, filters) => {
    const useSystemIndex = filters.some((f) =>
        f.arguments.includes('system:index')
    )

    const getPeriod = ({ id, properties }) => {
        const year =
            properties.year ||
            new Date(properties['system:time_start']).getFullYear()

        return periodType === 'YEARLY'
            ? { id: useSystemIndex ? id : year, name: String(year) }
            : {
                  id,
                  name:
                      periodType === 'EE_MONTHLY'
                          ? getMonth(properties)
                          : getStartEndDate(properties),
                  year,
              }
    }

    const eeWorker = await getWorkerInstance()

    /*
    if (periodType === 'daily') {
        const { min, max } = await eeWorker.getTimeRange(eeId)
        console.log('time range', new Date(min), new Date(max))
        return []
    }
    */

    // try {
    const { features } = await eeWorker.getPeriods(eeId)

    return features.map(getPeriod)
}

// const oneDayInMilliseconds = 24 * 60 * 60 * 1000

export const getTimeRange = async (eeId) => {
    if (timeRangeCache[eeId]) {
        return timeRangeCache[eeId]
    }

    const eeWorker = await getWorkerInstance()

    return eeWorker.getTimeRange(eeId).then(({ min, max }) => {
        const response = {
            firstDate: min ? formatDate(min) : null,
            lastDate: max ? formatDate(max) : null,
        }

        timeRangeCache[eeId] = response

        return response
    })
}

const getRelativeDate = (days) => {
    const dateObj = new Date()
    dateObj.setDate(dateObj.getDate() + days)
    return formatDate(dateObj)
}

export const createTimeRange = (range) => {
    const { firstDate, lastDate } = range

    return {
        firstDate,
        lastDate:
            typeof lastDate === 'number'
                ? getRelativeDate(range.lastDate)
                : lastDate,
    }
}

export const getPrecision = (values = []) => {
    if (values.length) {
        const sortedValues = [...values].sort((a, b) => a - b)
        const minValue = sortedValues[0]
        const maxValue = sortedValues[sortedValues.length - 1]
        const gapValue = maxValue - minValue
        const absValue = Math.abs(maxValue)

        if (absValue >= 10000) {
            return 0
        }

        if (absValue >= 1000) {
            return gapValue > 10 ? 0 : 1
        }

        if (absValue >= 100) {
            return gapValue > 1 ? 1 : 2
        }

        if (absValue >= 10) {
            return gapValue > 0.1 ? 2 : 3
        }

        if (absValue >= 1) {
            return gapValue > 0.01 ? 3 : 4
        }

        return gapValue > 0.001 ? 4 : 5
    }

    return 0
}
