import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import Highcharts from 'highcharts'

const Temperature = ({ data }) => {
    const chartRef = useRef()

    useEffect(() => {
        if (data && chartRef.current) {
            // Last 12 months
            const series = data.slice(-12).map((d) => ({
                x: new Date(d.id).getTime(),
                y: Math.round((d['temperature_2m'] - 273.15) * 10) / 10,
            }))

            // console.log(data)

            Highcharts.chart(chartRef.current, {
                title: {
                    text: 'Temperatures last year',
                },
                subtitle: {
                    text: '',
                },
                credits: {
                    enabled: false,
                },
                exporting: {
                    enabled: false,
                },
                tooltip: {
                    shared: true,
                },
                plotOptions: {
                    series: {
                        turboThreshold: 0,
                    },
                },
                chart: {
                    type: 'line',
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: 2592000000,
                    labels: {
                        format: '{value: %b}',
                    },
                },
                yAxis: {
                    // min: 0,
                    title: false,
                    labels: {
                        format: '{value}°C',
                    },
                },
                series: [
                    {
                        data: series,
                        name: 'Monthly temperature',
                        color: '#C60000',
                    },
                ],
            })
        }
    }, [data, chartRef])

    if (!data) {
        return <div>{i18n.t('Loading weather data')}...</div>
    }

    return <div ref={chartRef}></div>
}

Temperature.propTypes = {
    data: PropTypes.array,
}

export default Temperature
