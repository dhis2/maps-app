import eventLoader from './eventLoader';
import trackedEntityLoader from './trackedEntityLoader';
import facilityLoader from './facilityLoader';
import thematicLoader from './thematicLoader';
import orgUnitLoader from './orgUnitLoader';
import earthEngineLoader from './earthEngineLoader';
import externalLoader from './externalLoader';

const layerType = {
    event: eventLoader,
    trackedEntity: trackedEntityLoader,
    facility: facilityLoader,
    thematic: thematicLoader,
    orgUnit: orgUnitLoader,
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
