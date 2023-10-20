import PropTypes from 'prop-types'
import React, { useState } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import PeriodTypeSelect, { MONTHLY } from './PeriodTypeSelect.js'
import Chart from './Chart.js'
import getMonthlyChart from './charts/precipitationMonthly.js'
import getDailyChart from './charts/precipitationDaily.js'

const PrecipitationTab = ({ loading, monthlyData, dailyData }) => {
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

PrecipitationTab.propTypes = {
    dailyData: PropTypes.array,
    monthlyData: PropTypes.array,
}

export default PrecipitationTab
