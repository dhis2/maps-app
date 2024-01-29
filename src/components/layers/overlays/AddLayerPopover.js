import { useCachedDataQuery } from '@dhis2/analytics'
import { Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addLayer, editLayer } from '../../../actions/layers.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import useEarthEngineLayers from '../../../hooks/useEarthEngineLayersStore.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import earthEngineLayers from '../../../constants/earthEngineLayers/index.js'
import ManageLayersButton from '../../earthEngine/ManageLayersButton.js'
import LayerList from './LayerList.js'

const includeEarthEngineLayers = (layerTypes, addedLayers) => {
    // Earth Engine layers that are added to this DHIS2 instance
    const eeLayers = earthEngineLayers
        .filter((l) => !l.legacy && addedLayers.includes(l.layerId))
        .sort((a, b) => a.name.localeCompare(b.name))

    // Make copy before slicing below
    const layers = [...layerTypes]

    // Insert Earth Engine layers before external layers
    layers.splice(5, 0, ...eeLayers)

    return layers
}

const AddLayerPopover = ({ anchorEl, onClose, onManaging }) => {
    const isSplitView = useSelector((state) =>
        isSplitViewMap(state.map.mapViews)
    )
    const dispatch = useDispatch()
    const { layerTypes } = useCachedDataQuery()
    const { addedLayers } = useEarthEngineLayers()
    const layers = includeEarthEngineLayers(layerTypes, addedLayers)

    const onLayerSelect = (layer) => {
        const config = { ...layer }
        const layerType = layer.layer

        dispatch(
            layerType === EXTERNAL_LAYER ? addLayer(config) : editLayer(config)
        )

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
            <ManageLayersButton onClick={onManaging} />
        </Popover>
    )
}

AddLayerPopover.propTypes = {
    onClose: PropTypes.func.isRequired,
    onManaging: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
}

export default AddLayerPopover
