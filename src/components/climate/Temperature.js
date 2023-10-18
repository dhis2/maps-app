import i18n from '@dhis2/d2-i18n'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'

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
                    text: i18n.t('Temperatures last year'),
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
                        name: i18n.t('Monthly temperature'),
                        color: '#C60000',
                    },
                ],
            })
        }
    }, [data, chartRef])

    return data ? (
        <>
            <div ref={chartRef}></div>
            <ERA5Source />
        </>
    ) : (
        <DataLoading />
    )
}

Temperature.propTypes = {
    data: PropTypes.array,
}

export default Temperature
