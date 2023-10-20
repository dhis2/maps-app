import { useState, useEffect } from 'react'
import { getTimeSeries } from '../util/earthEngine.js'

const monthlyConfig = {
    datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
    band: [
        'temperature_2m',
        'temperature_2m_min',
        'temperature_2m_max',
        'total_precipitation_sum',
        // 'total_precipitation_min',
        // 'total_precipitation_max',
    ],
    filters: [
        {
            type: 'gte',
            arguments: ['system:index', '1970-01-01'],
        },
    ],
}

const useClimateData = (geometry) => {
    const [monthlyData, setMonthlyData] = useState(null)

    useEffect(() => {
        getTimeSeries(monthlyConfig, geometry).then(setMonthlyData)
    }, [geometry])

    return {
        monthlyData,
        loading: !monthlyData,
    }
}

export default useClimateData
