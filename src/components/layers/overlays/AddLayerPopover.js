import { useCachedDataQuery } from '@dhis2/analytics'
import { Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { addLayer, editLayer } from '../../../actions/layers.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import { earthEngineLayers } from '../../../constants/earthEngine.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import useEarthEngineLayersStore from '../../../hooks/useEarthEngineLayersStore'
import LayerList from './LayerList.js'

const AddLayerPopover = ({
    anchorEl,
    isSplitView,
    addLayer,
    editLayer,
    onClose,
}) => {
    const { layerTypes } = useCachedDataQuery()
    const { storedLayers } = useEarthEngineLayersStore()

    // Earth Engine layers that are added to this DHIS2 instance
    const eeLayers = earthEngineLayers
        .filter((l) => !l.legacy && storedLayers.includes(l.layerId))
        .sort((a, b) => a.name.localeCompare(b.name))

    // Make copy before slicing below
    const layers = [...layerTypes]

    // Insert Earth Engine layers before external layers
    layers.splice(5, 0, ...eeLayers)

    const onLayerSelect = (layer) => {
        const config = { ...layer }
        const layerType = layer.layerType || layer.layer

        layerType === EXTERNAL_LAYER ? addLayer(config) : editLayer(config)

        onClose()
    }

    return (
        <Popover
            arrow={false}
            reference={anchorEl}
            placement="bottom-start"
            maxWidth={700}
            onClickOutside={onClose}
            dataTest="addlayerpopover"
        >
            <LayerList
                layers={layers}
                isSplitView={isSplitView}
                onLayerSelect={onLayerSelect}
            />
        </Popover>
    )
}

AddLayerPopover.propTypes = {
    addLayer: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
    isSplitView: PropTypes.bool,
}

export default connect(
    ({ map }) => ({
        isSplitView: isSplitViewMap(map.mapViews),
    }),
    { addLayer, editLayer }
)(AddLayerPopover)
