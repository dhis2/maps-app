import { useState, useEffect } from 'react'
import { getTimeSeries } from '../../../util/earthEngine.js'

const band = [
    'temperature_2m',
    'temperature_2m_min',
    'temperature_2m_max',
    'total_precipitation_sum',
    // 'total_precipitation_min',
    // 'total_precipitation_max',
]

const reducer = ['mean', 'min', 'max', 'mean']

const monthlyConfig = {
    datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
    band,
    filters: [
        {
            type: 'gte',
            arguments: ['system:time_start', 0],
        },
    ],
    reducer,
}

const dailyConfig = {
    datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
    band,
    filters: [
        {
            type: 'gte',
            arguments: ['system:time_start', 1666216800000], // TODO: Make dynamic
        },
    ],
    reducer,
}

const getMonthFromId = (id) => {
    const year = id.substring(0, 4)
    const month = id.substring(4, 6)
    return `${year}-${month}`
}

const getDayFromId = (id) => {
    const year = id.substring(0, 4)
    const month = id.substring(4, 6)
    const day = id.substring(6, 8)
    return `${year}-${month}-${day}`
}

const parseMonthly = (data) =>
    data.map((d) => ({ ...d, id: getMonthFromId(d.id) }))

const parseDaily = (data) => data.map((d) => ({ ...d, id: getDayFromId(d.id) }))

const useClimateData = (geometry) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        Promise.all([
            getTimeSeries(monthlyConfig, geometry).then(parseMonthly),
            getTimeSeries(dailyConfig, geometry).then(parseDaily),
        ]).then(([monthlyData, dailyData]) =>
            setData({ monthlyData, dailyData })
        )
    }, [geometry])

    return {
        loading: !data,
        ...data,
    }
}

export default useClimateData
