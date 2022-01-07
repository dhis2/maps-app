/* eslint-disable prettier/prettier */
var fs = require('fs');
console.log('create file src/map_cypress.js');

var data = fs
    .readFileSync('src/map.js')
    .toString()
    .split('\n');

data.splice(
    186,
    0,
    "document.getElementById('basemapId').textContent = config.basemap.id;"
);
data.splice(
    187,
    0,
    "document.getElementById('basemapName').textContent = config.basemap.name;"
);
data.splice(
    188,
    0,
    "document.getElementById('basemapIsVisible').textContent = config.basemap.isVisible === false ? 'no' : 'yes';"
);
data.splice(
    189,
    0,
    "document.getElementById('mapviewsCount').textContent = config.mapViews.length;"
);
data.splice(
    190,
    0,
    "document.getElementById('mapviewsNames').textContent = config.mapViews.map(view => view.layer).join(' ');"
);

var text = data.join('\n');

fs.writeFile('src/mapcypress.js', text, function(err) {
    if (err) return console.log(err);
});
