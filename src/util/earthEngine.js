import i18n from '@dhis2/d2-i18n'
import { loadEarthEngineWorker } from '../components/map/MapApi.js'
import { apiFetch } from './api.js'
import { formatStartEndDate } from './time.js'
import { EE_MONTHLY } from '../constants/periods.js'
import { legacyNighttimeDatasetId } from '../constants/earthEngineLayers/legacy/nighttime_DMSP-OLS.js'

export const classAggregation = ['percentage', 'hectares', 'acres']

export const hasClasses = (type) => classAggregation.includes(type)

export const getStartEndDate = (data) =>
    formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'], // - 7200001, // Minus 2 hrs to end the day before
        null,
        false
    )

const getStaticFiltersFromDynamic = (filters, ...args) =>
    filters.map((filter) => ({
        ...filter,
        arguments: filter.arguments.map((arg) => {
            const match = arg.match(/^\$([0-9]+)$/)
            return match ? args[match[1] - 1] : arg
        }),
    }))

const getMonth = (data) => {
    const date = new Date(data['system:time_start'])
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()
    return `${month} ${year}`
}

export const getStaticFilterFromPeriod = (period, filters) => {
    if (!period || !filters) {
        return
    }

    return getStaticFiltersFromDynamic(filters, period.id)
}

const nonDigits = /^\D+/g

// Only used for backward compatibility
export const getPeriodFromFilter = (filter, datasetId) => {
    if (!Array.isArray(filter) || !filter.length) {
        return null
    }

    const isNightTimeLights = datasetId === legacyNighttimeDatasetId

    const { id, name, year, arguments: args } = filter[0]
    let periodId = id || args[1]

    // Remove non-digits from periodId (needed for backward compatibility for population layers saved before 2.41)
    if (!isNightTimeLights && nonDigits.test(periodId)) {
        periodId = Number(periodId.replace(nonDigits, '')) // Remove non-digits
    }

    return {
        id: periodId,
        name,
        year,
    }
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
                      periodType === EE_MONTHLY
                          ? getMonth(properties)
                          : getStartEndDate(properties),
                  year,
              }
    }

    const eeWorker = await getWorkerInstance()

    const { features } = await eeWorker.getPeriods(eeId)

    return features.map(getPeriod)
}
