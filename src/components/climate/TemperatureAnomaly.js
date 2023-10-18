import i18n from '@dhis2/d2-i18n'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'

const months = {
    '01': i18n.t('Jauary'),
    '02': i18n.t('February'),
    '03': i18n.t('March'),
    '04': i18n.t('April'),
    '05': i18n.t('May'),
    '06': i18n.t('June'),
    '07': i18n.t('July'),
    '08': i18n.t('August'),
    '09': i18n.t('September'),
    10: i18n.t('October'),
    11: i18n.t('November'),
    12: i18n.t('December'),
}

// https://climate.copernicus.eu/copernicus-september-2023-unprecedented-temperature-anomalies
// https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR
// https://developers.google.com/earth-engine/datasets/catalog/NASA_GDDP-CMIP6
// https://developers.google.com/earth-engine/datasets/catalog/NASA_NEX-GDDP
const ClimateChange = ({ data }) => {
    const chartRef = useRef()

    useEffect(() => {
        if (data && chartRef.current) {
            const lastMonth = data.slice(-1)[0].id.substring(5, 7)
            const month = months[lastMonth]

            const monthData = data.filter(
                (d) => d.id.substring(5, 7) === lastMonth
            )

            const normal =
                monthData
                    .filter((d) => {
                        const year = d.id.substring(0, 4)
                        return year >= 1991 && year <= 2020
                    })
                    .reduce((v, d) => v + d['temperature_2m'], 0) /
                    30 -
                273.15

            const years = monthData.map((d) => d.id.substring(0, 4))

            const series = monthData.map(
                (d) =>
                    Math.round((d['temperature_2m'] - 273.15 - normal) * 10) /
                    10
            )

            Highcharts.chart(chartRef.current, {
                title: {
                    text: `Temperature anomaly - ${month}`,
                },
                subtitle: {
                    text: 'Reference period: 1991-2020',
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
                chart: {
                    type: 'column',
                    height: 580,
                },
                plotOptions: {
                    column: {
                        pointWidth: 13,
                        pointPadding: 0,
                        borderWidth: 1,
                    },
                },
                xAxis: {
                    type: 'category',
                    categories: years,
                    labels: {
                        format: '{value: %b}',
                    },
                },
                yAxis: {
                    title: false,
                    labels: {
                        format: '{value}°C',
                    },
                },
                series: [
                    {
                        data: series,
                        name: 'Monthly temperature',
                        color: 'var(--colors-red500)',
                        negativeColor: 'var(--colors-blue500)',
                    },
                ],
                legend: { enabled: false },
            })
        }
    }, [data, chartRef])

    return <div ref={chartRef} />
}

ClimateChange.propTypes = {
    data: PropTypes.array,
}

export default ClimateChange
