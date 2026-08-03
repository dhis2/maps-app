import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sortLayers } from '../../actions/layers.js'
import { layersSortingEnd, layersSortingStart } from '../../actions/ui.js'
import BasemapCard from '../layers/basemaps/BasemapCard.jsx'
import LayersToggle from '../layers/LayersToggle.jsx'
import { DragHandleCtx } from './dragHandleContext.js'
import OverlayCard from './overlays/OverlayCard.jsx'
import styles from './styles/LayersPanel.module.css'

const SortableLayer = ({ layer }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: layer.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Keep the card being dragged above its siblings
        zIndex: isDragging ? 1 : undefined,
        position: isDragging ? 'relative' : undefined,
        opacity: isDragging ? 0 : 1,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <DragHandleCtx.Provider value={{ attributes, listeners }}>
                <OverlayCard layer={layer} />
            </DragHandleCtx.Provider>
        </div>
    )
}

SortableLayer.propTypes = {
    layer: PropTypes.object.isRequired,
}

const LayersPanel = () => {
    const layersPanelOpen = useSelector((state) => state.ui.layersPanelOpen)
    // Reversed so the last map view (top layer) is shown first
    const layers = useSelector((state) => [...state.map.mapViews].reverse())

    const dispatch = useDispatch()

    const [activeId, setActiveId] = useState(null)
    const activeLayer = layers.find((l) => l.id === activeId)

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require a small movement so a click on the handle isn't a drag
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const onDragStart = ({ active }) => {
        setActiveId(active.id)
        document.body.classList.add('layersSorting')
        dispatch(layersSortingStart())
    }

    const stopSorting = () => {
        setActiveId(null)
        setTimeout(() => {
            document.body.classList.remove('layersSorting')
            dispatch(layersSortingEnd())
        }, 100)
    }

    const onDragEnd = ({ active, over }) => {
        stopSorting()

        if (over && active.id !== over.id) {
            const oldIndex = layers.findIndex((l) => l.id === active.id)
            const newIndex = layers.findIndex((l) => l.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                dispatch(sortLayers({ oldIndex, newIndex }))
            }
        }
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragCancel={stopSorting}
                        >
                            <SortableContext
                                items={layers.map((layer) => layer.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div data-test="sortable-layers-list">
                                    {layers.map((layer) => (
                                        <SortableLayer
                                            key={layer.id}
                                            layer={layer}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay
                                style={{ height: 'auto' }}
                                zIndex={1999}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                {activeLayer ? (
                                    <div className={styles.dragOverlay}>
                                        <OverlayCard layer={activeLayer} />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
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
