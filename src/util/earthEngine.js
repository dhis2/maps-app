import i18n from '@dhis2/d2-i18n'
import { loadEarthEngineWorker } from '../components/map/MapApi.js'
import { apiFetch } from './api.js'
import { formatStartEndDate } from './time.js'

export const classAggregation = ['percentage', 'hectares', 'acres']

export const hasClasses = (type) => classAggregation.includes(type)

export const getStartEndDate = (data) =>
    formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'], // - 7200001, // Minus 2 hrs to end the day before
        null,
        false
    )

export const getPeriodFromFilter = (filter) => {
    if (!Array.isArray(filter) || !filter.length) {
        return null
    }

    const { id, name, year, arguments: args } = filter[0]

    return {
        id: id || args[1],
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

export const getPeriods = async (eeId, periodType) => {
    const getPeriod = ({ id, properties }) => {
        const year = new Date(properties['system:time_start']).getFullYear()
        const name =
            periodType === 'Yearly' ? String(year) : getStartEndDate(properties)

        // Remove when old population should not be supported
        if (eeId === 'WorldPop/POP') {
            return { id: name, name, year }
        }

        return { id, name, year }
    }

    const eeWorker = await getWorkerInstance()

    const { features } = await eeWorker.getPeriods(eeId)
    return features.map(getPeriod)
}

export const defaultFilters = ({ id, name, year }) => [
    {
        type: 'eq',
        arguments: ['system:index', String(id)],
        name,
        year,
    },
]
