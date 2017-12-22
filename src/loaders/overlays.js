import eventLoader from './eventLoader';
import facilityLoader from './facilityLoader';
import thematicLoader from './thematicLoader';
import boundaryLoader from './boundaryLoader';
import earthEngineLoader from './earthEngineLoader';
import externalLoader from './externalLoader';

const layerType = {
    event: eventLoader,
    facility: facilityLoader,
    thematic: thematicLoader,
    boundary: boundaryLoader,
    earthEngine: earthEngineLoader,
    external: externalLoader,
};

export const fetchOverlay = (config) => {
    console.log('fetchOverlay', config);

    // const type = config.type || config.layer.replace(/\d$/, ''); // Remove thematic number, temp, should be done in parseFavorite
    const type = config.layer;

    const Loader = layerType[type];

    if (Loader) {
        return Loader(layer);
    } else {
        reject('Unknown layer type.'); // TODO
    }
};
