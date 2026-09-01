import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import { getLayerSourceId } from '../../../util/layerSources.js'
import Layer from './Layer.jsx'
import styles from './styles/LayerList.module.css'

// PROTOTYPE ONLY - drag to reorder the pinned tiles. The whole tile is the
// drag handle, so a drag has to travel a little before it counts as one, and
// the click that lands after a drop is swallowed rather than adding the layer.
const SortableLayer = ({ id, ...layerProps }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const wasDragged = useRef(false)

    if (isDragging) {
        wasDragged.current = true
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0.4 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClickCapture={(event) => {
                if (wasDragged.current) {
                    wasDragged.current = false
                    event.preventDefault()
                    event.stopPropagation()
                }
            }}
            {...attributes}
            {...listeners}
        >
            <Layer {...layerProps} />
        </div>
    )
}

SortableLayer.propTypes = {
    id: PropTypes.string.isRequired,
}

const LayerList = ({
    layers,
    isSplitView,
    onLayerSelect,
    isPinned,
    onTogglePin,
    onReorder,
    variant,
}) => {
    const displayedLayers = isSplitView
        ? layers.filter((layer) => layer.layer === THEMATIC_LAYER)
        : layers

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require a small movement so a click on a tile isn't a drag
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const isSortable = variant === 'pinned' && !!onReorder
    const ids = displayedLayers.map(getLayerSourceId)

    const onDragEnd = ({ active, over }) => {
        if (over && active.id !== over.id) {
            onReorder(active.id, over.id)
        }
    }

    const grid = (
        <div
            className={variant === 'pinned' ? styles.pinnedList : styles.list}
            data-test="addlayerlist"
        >
            {displayedLayers.map((layer, index) => {
                const id = getLayerSourceId(layer)
                const props = {
                    onClick: onLayerSelect,
                    layer,
                    isPinned: isPinned?.(id),
                    onTogglePin,
                }

                return isSortable ? (
                    <SortableLayer key={id} id={id} {...props} />
                ) : (
                    <Layer key={`layer-${index}`} {...props} />
                )
            })}
        </div>
    )

    return (
        <div className={styles.layerList}>
            {isSortable ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext items={ids} strategy={rectSortingStrategy}>
                        {grid}
                    </SortableContext>
                </DndContext>
            ) : (
                grid
            )}
        </div>
    )
}

LayerList.propTypes = {
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
    isPinned: PropTypes.func,
    isSplitView: PropTypes.bool,
    variant: PropTypes.oneOf(['pinned']),
    onReorder: PropTypes.func,
    onTogglePin: PropTypes.func,
}

export default LayerList
