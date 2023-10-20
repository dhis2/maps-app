import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import PeriodTypeSelect, { MONTHLY } from './PeriodTypeSelect.js'
import Chart from './Chart.js'
import getMonthlyChart from './charts/temperatureMonthly.js'

const TemperatureTab = ({ data }) => {
    const [periodType, setPeriodType] = useState(MONTHLY)

    return data ? (
        <>
            <PeriodTypeSelect type={periodType} onChange={setPeriodType} />
            {periodType === MONTHLY ? (
                <Chart config={getMonthlyChart(data)} />
            ) : (
                <Chart config={getMonthlyChart(data)} />
            )}
            <ERA5Source />
        </>
    ) : (
        <DataLoading />
    )
}

TemperatureTab.propTypes = {
    data: PropTypes.array,
}

export default TemperatureTab
