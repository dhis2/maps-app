import PropTypes from 'prop-types'
import React, { useState } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import PeriodTypeSelect, { MONTHLY } from './PeriodTypeSelect.js'
import Chart from './Chart.js'
import getMonthlyChart from './charts/temperatureMonthly.js'
import getDailyChart from './charts/temperatureDaily.js'

const TemperatureTab = ({ loading, monthlyData, dailyData }) => {
    const [periodType, setPeriodType] = useState(MONTHLY)

    if (loading) {
        return <DataLoading />
    }

    return (
        <>
            <PeriodTypeSelect type={periodType} onChange={setPeriodType} />
            {periodType === MONTHLY ? (
                <Chart config={getMonthlyChart(monthlyData)} />
            ) : (
                <Chart config={getDailyChart(dailyData)} />
            )}
            <ERA5Source />
        </>
    )
}

TemperatureTab.propTypes = {
    dailyData: PropTypes.array,
    monthlyData: PropTypes.array,
}

export default TemperatureTab
