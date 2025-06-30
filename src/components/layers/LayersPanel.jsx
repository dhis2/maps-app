import cx from 'classnames'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { sortLayers } from '../../actions/layers.js'
import { layersSortingEnd, layersSortingStart } from '../../actions/ui.js'
import BasemapCard from '../layers/basemaps/BasemapCard.jsx'
import LayersToggle from '../layers/LayersToggle.jsx'
import OverlayCard from './overlays/OverlayCard.jsx'
import styles from './styles/LayersPanel.module.css'

const SortableLayer = SortableElement(OverlayCard)

// Draggable layers - last layer on top
const SortableLayersList = SortableContainer(({ layers }) => (
    <div data-test="sortable-layers-list">
        {layers.map((layer, index) => (
            <SortableLayer key={layer.id} index={index} layer={layer} />
        ))}
    </div>
))

const LayersPanel = () => {
    const layersPanelOpen = useSelector((state) => state.ui.layersPanelOpen)
    const layers = useSelector((state) => [...state.map.mapViews].reverse())

    const dispatch = useDispatch()

    const onSortStart = () => {
        document.body.classList.add('layersSorting')
        dispatch(layersSortingStart())
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setTimeout(() => {
            document.body.classList.remove('layersSorting')
            dispatch(layersSortingEnd())
        }, 100)
        dispatch(sortLayers({ oldIndex, newIndex }))
    }

    return (
        <div
            className={cx(styles.layersPanel, {
                [styles.collapsed]: !layersPanelOpen,
            })}
            data-test="layers-panel"
        >
            <div className={styles.layersPanelInner}>
                {layersPanelOpen ? (
                    <>
                        <SortableLayersList
                            layers={layers}
                            onSortStart={onSortStart}
                            onSortEnd={onSortEnd}
                            useDragHandle={true}
                        />
                        <div>
                            <BasemapCard />
                        </div>
                    </>
                ) : null}
            </div>
            <LayersToggle />
        </div>
    )
}

export default LayersPanel
