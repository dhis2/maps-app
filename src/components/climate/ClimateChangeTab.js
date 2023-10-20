import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import Chart from './Chart.js'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'
import getChart from './charts/temperatureAnomaly.js'

// https://developers.google.com/earth-engine/datasets/catalog/NASA_GDDP-CMIP6
const ClimateChangeTab = ({ data }) => {
    return data ? (
        <>
            <Chart config={getChart(data)} />
            <ERA5Source />
        </>
    ) : (
        <DataLoading />
    )
}

ClimateChangeTab.propTypes = {
    data: PropTypes.array,
}

export default ClimateChangeTab
