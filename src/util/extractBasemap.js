import { isString, isObject } from 'lodash/fp';
import { EXTERNAL_LAYER } from '../constants/layers';
import { DEFAULT_BASEMAP_ID } from '../constants/basemaps';

// Different ways of specifying a basemap - TODO: simplify!
// TODO - DEFAULT_BASEMAP_ID is not correct. We need the keyDefaultBaseMap sys setting
export const extractBasemap = config => {
    const externalBasemap = config.mapViews.find(
        view =>
            view.layer === EXTERNAL_LAYER &&
            JSON.parse(view.config || {}).mapLayerPosition === 'BASEMAP'
    );
    let basemap;
    let mapViews = config.mapViews;

    if (externalBasemap) {
        basemap = JSON.parse(externalBasemap.config);
        mapViews = config.mapViews.filter(
            view => view.id !== externalBasemap.id
        );
    } else if (isString(config.basemap)) {
        basemap =
            config.basemap === 'none'
                ? { id: DEFAULT_BASEMAP_ID, isVisible: false }
                : { id: config.basemap };
    } else if (isObject(config.basemap)) {
        basemap = config.basemap;
    } else {
        basemap = { id: DEFAULT_BASEMAP_ID }; // Default basemap
    }

    return {
        ...config,
        basemap: basemap,
        mapViews: mapViews,
    };
};
