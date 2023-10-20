import i18n from '@dhis2/d2-i18n'

const getChart = (data) => {
    const series = data.map((d) => ({
        x: new Date(d.id).getTime(),
        y: Math.round(d['total_precipitation_sum'] * 1000 * 10) / 10,
    }))

    // https://www.highcharts.com/demo/highcharts/arearange-line
    return {
        title: {
            text: i18n.t('Daily temperatures last year'),
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            valueSuffix: ' mm',
        },
        chart: {
            type: 'column',
            height: 480,
            zoomType: 'x',
        },
        plotOptions: {
            series: {
                pointPadding: 0,
                groupPadding: 0,
                borderWidth: 0,
            },
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
        ],
    }
}

export default getChart
