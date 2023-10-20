import Highcharts from 'highcharts'
import exporting from 'highcharts/highcharts-more'
import highchartsMore from 'highcharts/modules/exporting'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'

exporting(Highcharts)
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
