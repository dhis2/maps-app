import eventLoader from './eventLoader';
import trackedEntityLoader from './trackedEntityLoader';
import facilityLoader from './facilityLoader';
import thematicLoader from './thematicLoader';
import boundaryLoader from './boundaryLoader';
import earthEngineLoader from './earthEngineLoader';
import externalLoader from './externalLoader';

const layerType = {
    event: eventLoader,
    trackedEntity: trackedEntityLoader,
    facility: facilityLoader,
    thematic: thematicLoader,
    boundary: boundaryLoader,
    earthEngine: earthEngineLoader,
    external: externalLoader,
};

export const fetchLayer = config => {
    const Loader = layerType[config.layer];

    if (Loader) {
        return Loader({
            ...config,
            editCounter:
                config.editCounter !== undefined ? config.editCounter + 1 : 0,
        });
    } else {
        // eslint-disable-next-line
        console.log('Unknown layer type', config.layer, config);
    }
};
