import i18n from '@dhis2/d2-i18n'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import DataLoading from './DataLoading.js'
import ERA5Source from './ERA5Source.js'

const getMonthNormal = (data, month) => {
    const monthData = data.filter((d) => d.id.substring(5, 7) === month)

    const normal =
        (monthData
            .filter((d) => {
                const year = d.id.substring(0, 4)
                return year >= 1991 && year <= 2020
            })
            .reduce((v, d) => v + d['total_precipitation_sum'], 0) /
            30) *
        1000

    return Math.round(normal * 10) / 10
}

const Precipitation = ({ data }) => {
    const chartRef = useRef()

    useEffect(() => {
        if (data && chartRef.current) {
            const last12months = data.slice(-12)

            const series = last12months.map((d) => ({
                x: new Date(d.id).getTime(),
                y: Math.round(d['total_precipitation_sum'] * 1000 * 10) / 10,
            }))

            const normals = last12months.map((d) => ({
                x: new Date(d.id).getTime(),
                y: getMonthNormal(data, d.id.substring(5, 7)),
            }))

            Highcharts.chart(chartRef.current, {
                title: {
                    text: i18n.t('Precipitation last year'),
                },
                subtitle: {
                    text: 'Normals from reference period: 1991-2020',
                },
                credits: {
                    enabled: false,
                },
                exporting: {
                    enabled: false,
                },
                tooltip: {
                    shared: true,
                    valueSuffix: ' mm',
                },
                plotOptions: {
                    series: {
                        grouping: false,
                        borderWidth: 0,
                    },
                },
                chart: {
                    type: 'column',
                    height: 580,
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
                        name: i18n.t('Monthly precipitation'),
                        color: 'var(--colors-blue500)',
                        zIndex: 1,
                    },
                    {
                        data: normals,
                        name: i18n.t('Normal precipitation'),
                        color: 'var(--colors-grey400)',
                        pointPlacement: -0.2,
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

Precipitation.propTypes = {
    data: PropTypes.array,
}

export default Precipitation
