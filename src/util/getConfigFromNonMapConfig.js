import { generateUid } from 'd2/uid'
import { getThematicLayerFromAnalyticalObject } from './analyticalObject.js'

export const getConfigFromNonMapConfig = (config, defaultBasemapId) => {
    const { name } = config

    return getThematicLayerFromAnalyticalObject(config).then((mapView) => ({
        name,
        basemap: { id: defaultBasemapId },
        mapViews: [
            {
                id: generateUid(),
                ...mapView,
            },
        ],
    }))
}
