import { Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addLayer, editLayer } from '../../../actions/layers.js'
import earthEngineLayers from '../../../constants/earthEngineLayers/index.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import useKeyDown from '../../../hooks/useKeyDown.js'
import useManagedLayerSourcesStore from '../../../hooks/useManagedLayerSourcesStore.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import { groupLayerSources } from '../../../util/layerSources.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import ManageLayerSourcesButton from '../../layerSources/ManageLayerSourcesButton.jsx'
import LayerList from './LayerList.jsx'

const includeEarthEngineLayers = (defaultLayerSources, managedLayerSources) => {
    // Earth Engine layers that are added to this DHIS2 instance
    const managedEarthEngineLayers = earthEngineLayers().filter(
        (l) => !l.legacy && managedLayerSources.includes(l.layerId)
    )

    // Make copy before slicing below
    const layerSources = [...defaultLayerSources]

    // Insert Earth Engine layers before external layers
    layerSources.splice(5, 0, ...managedEarthEngineLayers)

    return layerSources
}

const AddLayerPopover = ({ anchorEl, onClose, onManaging }) => {
    const isSplitView = useSelector((state) =>
        isSplitViewMap(state.map.mapViews)
    )
    const dispatch = useDispatch()
    const { defaultLayerSources } = useCachedData()
    const { managedLayerSources } = useManagedLayerSourcesStore()
    const layerSources = includeEarthEngineLayers(
        defaultLayerSources,
        managedLayerSources
    )
    const groupedLayerSources = groupLayerSources(layerSources)
    console.log(
        '🚀 ~ AddLayerPopover ~ groupedLayerSources:',
        groupedLayerSources
    )

    useKeyDown('Escape', onClose)

    const onLayerSelect = (layer) => {
        let selectedLayer = layer
        if (layer.items) {
            selectedLayer = layer.items[0]?.items?.[0] || layer.items[0]
            console.log('🚀 ~ onLayerSelect ~ selectedLayer:', selectedLayer)
            delete selectedLayer.id
        }

        const config = { ...selectedLayer }
        const layerType = selectedLayer.layer

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
                layers={groupedLayerSources}
                isSplitView={isSplitView}
                onLayerSelect={onLayerSelect}
            />
            <ManageLayerSourcesButton onClick={onManaging} />
        </Popover>
    )
}

AddLayerPopover.propTypes = {
    onClose: PropTypes.func.isRequired,
    onManaging: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
}

export default AddLayerPopover
