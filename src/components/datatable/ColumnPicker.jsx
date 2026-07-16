import i18n from '@dhis2/d2-i18n'
import {
    IconDragHandle16,
    IconLayoutColumns16,
    IconLock16,
    IconLockOpen16,
} from '@dhis2/ui'
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
import { arrayMoveImmutable } from 'array-move'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setDataTableColumnConfig } from '../../actions/dataTable.js'
import { getVisibleHeaders } from '../../util/tableColumns.js'
import Checkbox from '../core/Checkbox.jsx'
import {
    FilterDropdownPopover,
    getDropdownPlacement,
} from './FilterDropdownPopover.jsx'
import styles from './styles/ColumnPicker.module.css'

const ColumnRow = ({
    header,
    isVisible,
    isPinned,
    onToggleVisible,
    onTogglePinned,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: header.dataKey })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0 : 1,
    }

    const pinLabel = isPinned
        ? i18n.t('Unpin column')
        : i18n.t('Pin column to the left')

    return (
        <div ref={setNodeRef} style={style} className={styles.columnRow}>
            <button
                type="button"
                className={styles.dragHandle}
                title={i18n.t('Drag to reorder')}
                aria-label={i18n.t('Drag to reorder')}
                data-test={`data-table-column-picker-drag-${header.dataKey}`}
                {...attributes}
                {...listeners}
            >
                <IconDragHandle16 />
            </button>
            <Checkbox
                label={header.name}
                checked={isVisible}
                onChange={(checked) => onToggleVisible(header.dataKey, checked)}
                className={styles.columnRowCheckbox}
                dataTest={`data-table-column-picker-visible-${header.dataKey}`}
            />
            <button
                type="button"
                className={cx(styles.pinButton, {
                    [styles.pinButtonActive]: isPinned,
                })}
                title={pinLabel}
                aria-label={pinLabel}
                data-test={`data-table-column-picker-pin-${header.dataKey}`}
                onClick={() => onTogglePinned(header.dataKey)}
            >
                {isPinned ? <IconLock16 /> : <IconLockOpen16 />}
            </button>
        </div>
    )
}

ColumnRow.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    isPinned: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onTogglePinned: PropTypes.func.isRequired,
    onToggleVisible: PropTypes.func.isRequired,
}

const ColumnPicker = ({ layerId, allHeaders, columnConfig }) => {
    const dispatch = useDispatch()
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState(null)

    // useTableData can legitimately return a null headers list (e.g. while
    // loading or on error) - guard here rather than trust callers to.
    const headers = allHeaders ?? []

    const visibleKeys =
        columnConfig?.visibleKeys ?? headers.map((h) => h.dataKey)
    const pinnedKeys = columnConfig?.pinnedKeys ?? []
    const orderedKeys =
        columnConfig?.orderedKeys ?? headers.map((h) => h.dataKey)

    // Same reorder-then-pin-to-front logic the table itself renders with,
    // so the picker's row order always matches the table's actual column
    // order. visibleKeys is deliberately not passed here - every column
    // gets a row in the picker (hidden ones just show an unchecked box).
    // Dragging a column across the pinned/unpinned boundary still snaps it
    // back to whichever side its own pinned state puts it on next render -
    // pin state is the button's job, not drag's.
    const orderedHeaders = getVisibleHeaders(headers, {
        orderedKeys,
        pinnedKeys,
    })

    const updateConfig = (partial) =>
        dispatch(
            setDataTableColumnConfig(layerId, {
                visibleKeys,
                pinnedKeys,
                orderedKeys,
                ...partial,
            })
        )

    const onToggleVisible = (dataKey, checked) => {
        const next = checked
            ? [...visibleKeys, dataKey]
            : visibleKeys.filter((k) => k !== dataKey)
        updateConfig({ visibleKeys: next })
    }

    const onTogglePinned = (dataKey) => {
        const next = pinnedKeys.includes(dataKey)
            ? pinnedKeys.filter((k) => k !== dataKey)
            : [...pinnedKeys, dataKey]
        updateConfig({ pinnedKeys: next })
    }

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

    const onDragEnd = ({ active, over }) => {
        setActiveId(null)

        if (over && active.id !== over.id) {
            const oldIndex = orderedHeaders.findIndex(
                (h) => h.dataKey === active.id
            )
            const newIndex = orderedHeaders.findIndex(
                (h) => h.dataKey === over.id
            )

            if (oldIndex !== -1 && newIndex !== -1) {
                const nextOrder = arrayMoveImmutable(
                    orderedHeaders,
                    oldIndex,
                    newIndex
                ).map((h) => h.dataKey)
                updateConfig({ orderedKeys: nextOrder })
            }
        }
    }

    const activeHeader = orderedHeaders.find((h) => h.dataKey === activeId)

    const anchorRect = anchorRef.current?.getBoundingClientRect()
    const { dropdownPlacement } = getDropdownPlacement(anchorRect)

    return (
        <>
            <button
                type="button"
                ref={anchorRef}
                className={styles.triggerButton}
                disabled={!headers.length}
                title={i18n.t('Configure columns')}
                aria-label={i18n.t('Configure columns')}
                data-test="data-table-column-picker-button"
                onClick={() => setIsOpen((o) => !o)}
            >
                <IconLayoutColumns16 />
            </button>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement={dropdownPlacement}
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.columnPickerPopover}>
                        <p className={styles.columnPickerHint}>
                            {i18n.t(
                                'Drag to reorder, check to show or hide, lock to pin left'
                            )}
                        </p>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragStart={({ active }) => setActiveId(active.id)}
                            onDragEnd={onDragEnd}
                            onDragCancel={() => setActiveId(null)}
                        >
                            <SortableContext
                                items={orderedHeaders.map((h) => h.dataKey)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className={styles.columnList}>
                                    {orderedHeaders.map((header) => (
                                        <ColumnRow
                                            key={header.dataKey}
                                            header={header}
                                            isVisible={visibleKeys.includes(
                                                header.dataKey
                                            )}
                                            isPinned={pinnedKeys.includes(
                                                header.dataKey
                                            )}
                                            onToggleVisible={onToggleVisible}
                                            onTogglePinned={onTogglePinned}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay modifiers={[restrictToVerticalAxis]}>
                                {activeHeader ? (
                                    <div
                                        className={cx(
                                            styles.columnRow,
                                            styles.dragOverlay
                                        )}
                                    >
                                        <IconDragHandle16 />
                                        {activeHeader.name}
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </FilterDropdownPopover>
            )}
        </>
    )
}

ColumnPicker.propTypes = {
    layerId: PropTypes.string.isRequired,
    allHeaders: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string,
            name: PropTypes.string,
        })
    ),
    columnConfig: PropTypes.shape({
        orderedKeys: PropTypes.arrayOf(PropTypes.string),
        pinnedKeys: PropTypes.arrayOf(PropTypes.string),
        visibleKeys: PropTypes.arrayOf(PropTypes.string),
    }),
}

export default ColumnPicker
