export const defaultBasemaps = [{
    id: 'osmLight',
    title: 'OSM Light',
    subtitle: 'Basemap',
    img: 'images/osmlight.png',
    config: {
        type: 'tileLayer',
        url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    },
},{
    id: 'openStreetMap',
    title: 'OSM Detailed',
    subtitle: 'Basemap',
    img: 'images/osm.png',
    config: {
        type: 'tileLayer',
        url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
},{
    id: 'googleStreets',
    title: 'Google Streets',
    subtitle: 'Basemap',
    img: 'images/googlestreets.png',
    config: {
        type: 'googleLayer',
        style: 'ROADMAP',
        apiKey: 'AIzaSyBjlDmwuON9lJbPMDlh_LI3zGpGtpK9erc',
    },
},{
    id: 'googleHybrid',
    title: 'Google Hybrid',
    subtitle: 'Basemap',
    img: 'images/googlehybrid.jpeg',
    config: {
        type: 'googleLayer',
        style: 'HYBRID',
        apiKey: 'AIzaSyBjlDmwuON9lJbPMDlh_LI3zGpGtpK9erc',
    },
}];


