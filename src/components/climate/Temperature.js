import i18n from '@dhis2/d2-i18n'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'

highchartsMore(Highcharts)

const Temperature = ({ data }) => {
    const chartRef = useRef()

    useEffect(() => {
        if (data && chartRef.current) {
            const last12months = data.slice(-12)

            const series = last12months.map((d) => ({
                x: new Date(d.id).getTime(),
                y: Math.round((d['temperature_2m'] - 273.15) * 10) / 10,
            }))

            const minMax = last12months.map((d) => [
                new Date(d.id).getTime(),
                Math.round((d['temperature_2m_min'] - 273.15) * 10) / 10,
                Math.round((d['temperature_2m_max'] - 273.15) * 10) / 10,
            ])

            const minValue = Math.min(...minMax.map((d) => d[1]))

            // https://www.highcharts.com/demo/highcharts/arearange-line
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
                /*
                exporting: {
                    enabled: false,
                },
                */
                /*
                plotOptions: {
                    series: {
                        turboThreshold: 0,
                    },
                },
                */
                tooltip: {
                    crosshairs: true,
                    shared: true,
                    valueSuffix: '°C',
                },
                xAxis: {
                    type: 'datetime',
                    tickInterval: 2592000000,
                    labels: {
                        format: '{value: %b}',
                    },
                },
                yAxis: {
                    min: minValue > 0 ? 0 : undefined,
                    title: false,
                    labels: {
                        format: '{value}°C',
                    },
                },
                chart: {
                    height: 580,
                },
                series: [
                    {
                        type: 'line',
                        data: series,
                        name: i18n.t('Mean temperature'),
                        color: 'var(--colors-red800)',
                        negativeColor: 'var(--colors-blue800)',
                        zIndex: 1,
                    },
                    {
                        type: 'arearange',
                        name: i18n.t('Temperature range'),
                        data: minMax,
                        color: 'var(--colors-red200)',
                        negativeColor: 'var(--colors-blue200)',
                        marker: {
                            enabled: false,
                        },
                        zIndex: 0,
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
