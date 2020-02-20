export const defaultBasemaps = [
    {
        id: 'osmLight',
        name: 'OSM Light',
        img: 'images/osmlight.png',
        config: {
            type: 'tileLayer',
            url:
                '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        },
    },
    {
        id: 'openStreetMap',
        name: 'OSM Detailed',
        img: 'images/osm.png',
        config: {
            type: 'tileLayer',
            url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
    },
    {
        id: 'googleStreets',
        name: 'Google Streets',
        img: 'images/googlestreets.png',
        config: {
            type: 'googleLayer',
            style: 'ROADMAP',
        },
    },
    {
        id: 'googleHybrid',
        name: 'Google Hybrid',
        img: 'images/googlehybrid.jpeg',
        config: {
            type: 'googleLayer',
            style: 'HYBRID',
        },
    },
    {
        id: 'bingLight',
        name: 'Bing Road',
        img: 'images/bingroad.png',
        config: {
            type: 'bingLayer',
            style: 'CanvasLight',
            apiKey:
                'AotYGLQC0RDcofHC5pWLaW7k854n-6T9mTunsev9LEFwVqGaVnG8b4KERNY9PeKA', // TODO: Read from db
        },
    },
    {
        id: 'bingDark',
        name: 'Bing Dark',
        img: 'images/bingdark.png',
        config: {
            type: 'bingLayer',
            style: 'CanvasDark',
        },
    },
    {
        id: 'bingAerial',
        name: 'Bing Aerial',
        img: 'images/bingaerial.jpeg',
        config: {
            type: 'bingLayer',
            style: 'Aerial',
        },
    },
    {
        id: 'bingHybrid',
        name: 'Bing Aerial Labels',
        img: 'images/binghybrid.jpeg',
        config: {
            type: 'bingLayer',
            style: 'AerialWithLabelsOnDemand',
        },
    },
];
