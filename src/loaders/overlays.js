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

export const fetchOverlay = (layer) => {
    const Loader = layerType[layer.type];

    if (Loader) {
        return Loader(layer);
    } else {
        reject('Unknown layer type.'); // TODO
    }
};
