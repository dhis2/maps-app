import i18n from '@dhis2/d2-i18n';

export const defaultBasemaps = () => [
    {
        id: 'osmLight',
        name: i18n.t('OSM Light'),
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
        name: i18n.t('OSM Detailed'),
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
        name: i18n.t('Google Streets'),
        img: 'images/googlestreets.png',
        config: {
            type: 'googleLayer',
            style: 'ROADMAP',
        },
    },
    {
        id: 'googleHybrid',
        name: i18n.t('Google Hybrid'),
        img: 'images/googlehybrid.jpeg',
        config: {
            type: 'googleLayer',
            style: 'HYBRID',
        },
    },
];
