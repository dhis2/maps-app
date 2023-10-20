import i18n from '@dhis2/d2-i18n'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'

highchartsMore(Highcharts)

// TODO: Reuse in TemperatureAnomaly.js
const getMonthNormal = (data, month) => {
    const monthData = data.filter((d) => d.id.substring(5, 7) === month)

    const normal =
        monthData
            .filter((d) => {
                const year = d.id.substring(0, 4)
                return year >= 1991 && year <= 2020
            })
            .reduce((v, d) => v + d['temperature_2m'], 0) /
            30 -
        273.15

    return Math.round(normal * 10) / 10
}

const getChart = (data) => {
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

    const normals = last12months.map((d) => ({
        x: new Date(d.id).getTime(),
        y: getMonthNormal(data, d.id.substring(5, 7)),
    }))

    // https://www.highcharts.com/demo/highcharts/arearange-line
    return {
        title: {
            text: i18n.t('Temperatures last year'),
        },
        subtitle: {
            text: 'Normals from reference period: 1991-2020',
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
                zIndex: 2,
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
            {
                type: 'spline',
                data: normals,
                name: i18n.t('Normal temperature'),
                dashStyle: 'dash',
                color: 'var(--colors-red500)',
                negativeColor: 'var(--colors-blue500)',
                marker: {
                    enabled: false,
                },
                zIndex: 1,
            },
        ],
    }
}

export default getChart
