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

export const fetchLayer = (config) => {
    const Loader = layerType[config.layer];

    if (Loader) {
        return Loader(config);
    } else {
        reject('Unknown layer type.'); // TODO
    }
};
