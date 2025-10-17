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
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import ManageLayerSourcesButton from '../../layerSources/ManageLayerSourcesButton.jsx'
import LayerList from './LayerList.jsx'

const includeEarthEngineLayers = (defaultLayerSources, managedLayerSources) => {
    // Earth Engine layers that are added to this DHIS2 instance
    const managedEarthEngineLayers = earthEngineLayers.filter(
        (l) => !l.legacy && managedLayerSources.includes(l.layerId)
    )

    // Make copy before slicing below
    const layerSources = [...defaultLayerSources]

    // Insert Earth Engine layers before external layers
    layerSources.splice(5, 0, ...managedEarthEngineLayers)

    return layerSources
}

const groupLayerSources = (layerSources) => {
    const groupedLayerSources = Object.values(
        layerSources.reduce((acc, obj) => {
            if (!obj.group) {
                const { layer, layerId, config, ...layerProps } = obj
                const key = layerId ?? config?.id ?? layer
                acc[key] = { layer, layerId, config, ...layerProps }
            } else {
                const { groupId: key, ...groupProps } = obj.group
                if (!acc[key]) {
                    acc[key] = {
                        layer: obj.layer,
                        id: key,
                        ...groupProps,
                        group: [],
                    }
                }
                acc[key].group.push(obj)
            }
            return acc
        }, {})
    )

    groupedLayerSources.forEach((item) => {
        if (item.group) {
            const summary = item.group.map((g) => ({
                id: g.layerId ?? g.config?.id ?? g.layer,
                name: g.name ?? g.label ?? g.id,
            }))
            item.group.forEach((g) => {
                g.group.items = summary
            })
        }
    })

    return groupedLayerSources
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

    useKeyDown('Escape', onClose)

    const onLayerSelect = (layer) => {
        let selectedLayer = layer
        if (layer.group) {
            selectedLayer = layer.group[0]
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
