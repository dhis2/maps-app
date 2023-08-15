import cx from 'classnames'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { sortLayers } from '../../actions/layers.js'
import Drawer from '../core/Drawer.js'
import BasemapCard from '../layers/basemaps/BasemapCard.js'
import OverlayCard from './overlays/OverlayCard.js'
import styles from './styles/LayersPanel.module.css'

const SortableLayer = SortableElement(OverlayCard)

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ layers }) => (
    <div>
        {layers.map((layer, index) => (
            <SortableLayer key={layer.id} index={index} layer={layer} />
        ))}
    </div>
))

const LayersPanel = () => {
    const layersPanelOpen = useSelector((state) => state.ui.layersPanelOpen)
    const layers = useSelector((state) => [...state.map.mapViews].reverse())

    const dispatch = useDispatch()

    const onSort = () => dispatch(sortLayers())

    return (
        <div
            className={cx(styles.layersPanel, {
                [styles.collapsed]: !layersPanelOpen,
            })}
        >
            {layersPanelOpen && (
                <Drawer position="left">
                    <SortableLayersList
                        layers={layers}
                        onSortEnd={onSort}
                        useDragHandle={true}
                    />
                    <div>
                        <BasemapCard />
                    </div>
                </Drawer>
            )}
        </div>
    )
}

export default LayersPanel
