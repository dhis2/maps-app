import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import Highcharts from 'highcharts'

const Precipitation = ({ data }) => {
    const chartRef = useRef()

    useEffect(() => {
        if (data && chartRef.current) {
            // Last 12 months
            const series = data.slice(-12).map((d) => ({
                x: new Date(d.id).getTime(),
                y: Math.round(d['total_precipitation_sum'] * 1000 * 10) / 10,
            }))

            Highcharts.chart(chartRef.current, {
                title: {
                    text: 'Precipitation last year',
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
                /*
                plotOptions: {
                    column: {
                        pointWidth: 2,
                        pointPadding: 0.2,
                        borderWidth: 0,
                    },
                },
                */
                chart: {
                    type: 'column',
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: 2592000000,
                    labels: {
                        format: '{value: %b}',
                    },
                },
                yAxis: {
                    min: 0,
                    title: false,
                    labels: {
                        format: '{value} mm',
                    },
                },
                series: [
                    {
                        data: series,
                        name: 'Monthly precipitation',
                        // color: '#C60000',
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

Precipitation.propTypes = {
    data: PropTypes.array,
}

export default Precipitation
