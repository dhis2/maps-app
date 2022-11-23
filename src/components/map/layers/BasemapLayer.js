import log from 'loglevel'
import PropTypes from 'prop-types'
import { useMemo, useEffect } from 'react'

const BASEMAP_LAYER_INDEX = 0

const BasemapLayer = ({ id, config, opacity, isVisible }, { map }) => {
    const basemap = useMemo(
        () =>
            map.createLayer({
                ...config,
                id,
                index: BASEMAP_LAYER_INDEX,
            }),
        [map, id, config]
    )

    useEffect(() => {
        map.addLayer(basemap).catch(
            (errorMessage) =>
                log.error(`Basemap could not be added: ${errorMessage}`) // TODO - use app-runtime alert system
        )
        return () => map.removeLayer(basemap)
    }, [map, basemap])

    useEffect(() => {
        basemap.setOpacity(opacity)
    }, [basemap, opacity])

    useEffect(() => {
        basemap.setVisibility(isVisible)
    }, [basemap, isVisible])

    return null
}

BasemapLayer.contextTypes = { map: PropTypes.object }

BasemapLayer.propTypes = {
    config: PropTypes.object,
    id: PropTypes.string,
    isVisible: PropTypes.bool,
    opacity: PropTypes.number,
}

export default BasemapLayer
