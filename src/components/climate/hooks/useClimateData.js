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

const monthlyConfig = {
    datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
    periodType: 'monthly',
    band,
    filters: [
        {
            type: 'gte',
            arguments: ['system:time_start', 0],
        },
    ],
}

const dailyConfig = {
    datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
    periodType: 'daily',
    band,
    filters: [
        {
            type: 'gte',
            arguments: ['system:time_start', 1666216800000], // TODO: Make dynamic
        },
    ],
}

const useClimateData = (geometry) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        Promise.all([
            getTimeSeries(monthlyConfig, geometry),
            getTimeSeries(dailyConfig, geometry),
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
