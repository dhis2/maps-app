import { generateUid } from 'd2/uid'
import { getThematicLayerFromAnalyticalObject } from './analyticalObject.js'

export const getConfigFromNonMapConfig = (config, defaultBasemapId, engine) => {
    const { name } = config

    return getThematicLayerFromAnalyticalObject({ ao: config, engine }).then(
        (mapView) => ({
            name,
            basemap: { id: defaultBasemapId },
            mapViews: [
                {
                    id: generateUid(),
                    ...mapView,
                },
            ],
        })
    )
}
