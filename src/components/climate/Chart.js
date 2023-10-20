import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'

highchartsMore(Highcharts)

const Chart = ({ config }) => {
    const chartRef = useRef()

    useEffect(() => {
        Highcharts.chart(chartRef.current, config)
    }, [config, chartRef])

    return <div ref={chartRef} />
}

Chart.propTypes = {
    config: PropTypes.object.isRequired,
}

export default Chart
