import i18n from '@dhis2/d2-i18n'
import { loadEarthEngineWorker } from '../components/map/MapApi.js'
import { legacyNighttimeDatasetId } from '../constants/earthEngineLayers/legacy/nighttime_DMSP-OLS.js'
import { EE_MONTHLY, EE_WEEKLY, EE_DAILY } from '../constants/periods.js'
import { formatStartEndDate } from './time.js'

const oneDayInMs = 24 * 60 * 60 * 1000

export const classAggregation = ['percentage', 'hectares', 'acres']

export const hasClasses = (type) => classAggregation.includes(type)

export const getStartEndDate = (data) => {
    const period = formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'] - oneDayInMs, // Subtract one day to make it inclusive
        null
    )
    return period
}

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

const getWeek = (data) => {
    const dateStart = new Date(data['system:time_start'])
    const dateEnd = new Date(data['system:time_end'])
    return `Week ${data['week']} - ${dateStart
        .toISOString()
        .slice(0, 10)} - ${dateEnd.toISOString().slice(0, 10)}`
}

const getDay = (data) =>
    new Date(data['system:time_start']).toISOString().slice(0, 10)

const getDatasetPeriodInfo = (first, last) => {
    const startDate = new Date(first.properties['system:time_start'])
    let endDate
    if (last.properties['system:time_end']) {
        endDate = new Date(last.properties['system:time_end'])
    } else {
        endDate = new Date(last.properties['system:time_start'])
    }
    const startYear = startDate.getUTCFullYear()
    const endYear = endDate.getUTCFullYear()
    return {
        startDate,
        endDate,
        startYear,
        endYear,
    }
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

export const getAuthTokenFn = (engine) => async () => {
    try {
        const response = await engine.query({
            token: { resource: 'tokens/google' },
        })
        const token = response.token

        if (token && token.status === 'ERROR') {
            throw new Error(
                i18n.t(
                    'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.'
                )
            )
        }

        return {
            token_type: 'Bearer',
            ...token,
        }
    } catch (e) {
        if (e.details?.httpStatusCode === 500) {
            throw new Error(
                i18n.t(
                    'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.'
                )
            )
        }

        if (e.message) {
            throw new Error(e.message)
        }

        throw new Error(
            i18n.t('Cannot get authorization token for Google Earth Engine.')
        )
    }
}

let workerPromise

// Load EE worker and set token
const getWorkerInstance = async (engine) => {
    const getAuthToken = getAuthTokenFn(engine)
    workerPromise =
        workerPromise ||
        (async () => {
            const EarthEngineWorker = await loadEarthEngineWorker(getAuthToken)
            return await new EarthEngineWorker()
        })()

    return workerPromise
}

export const getPeriods = async ({
    datasetId,
    periodType,
    periodReducer,
    year,
    datesRange,
    filters,
    engine,
}) => {
    const useSystemIndex = filters.some((f) =>
        f.arguments.includes('system:index')
    )

    const getPeriod = ({ id, properties }) => {
        const startDate = new Date(properties['system:time_start'])
        const endDate = new Date(properties['system:time_end'])
        // Determine the period year:
        // - use properties.year if available
        // - otherwise endDate year for periods between years (eg weekly datasets)
        // - fallback to startDate year (eg daily datasets or yearly datasets with next-year endDate)
        const year = properties.year || endDate.getFullYear()
        const yearFallback = properties.year || startDate.getFullYear()

        const base = {
            id,
            startDate,
            endDate,
            year,
        }

        switch (periodType) {
            case 'YEARLY':
                return {
                    ...base,
                    year: yearFallback,
                    id: useSystemIndex ? id : yearFallback,
                    name: String(yearFallback),
                }
            case EE_DAILY:
                return {
                    ...base,
                    year: yearFallback,
                    id: useSystemIndex ? id : yearFallback,
                    name: getDay(properties),
                }
            case EE_WEEKLY:
                return {
                    ...base,
                    name: getWeek(properties),
                }
            case EE_MONTHLY:
                return {
                    ...base,
                    name: getMonth(properties),
                }
            default:
                return {
                    ...base,
                    name: getStartEndDate(properties),
                }
        }
    }

    const eeWorker = await getWorkerInstance(engine)
    const { features } = await eeWorker.getPeriods({
        datasetId,
        year,
        datesRange,
        periodReducer,
    })
    return features.map(getPeriod)
}

export const getYears = async ({ datasetId, engine }) => {
    const eeWorker = await getWorkerInstance(engine)
    const { first, last } = await eeWorker.getCollectionSpan(datasetId)
    const periodInfo = getDatasetPeriodInfo(first, last)
    return periodInfo
}
