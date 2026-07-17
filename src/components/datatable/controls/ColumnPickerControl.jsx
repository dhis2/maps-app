import i18n from '@dhis2/d2-i18n'
import {
    IconDragHandle16,
    IconLayoutColumns16,
    IconLock16,
    IconLockOpen16,
    Tooltip,
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
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { setDataTableColumnConfig } from '../../../actions/dataTable.js'
import { getVisibleHeaders } from '../../../util/tableColumns.js'
import Checkbox from '../../core/Checkbox.jsx'
import {
    FilterDropdownPopover,
    getDropdownPlacement,
} from '../FilterDropdownPopover.jsx'
import styles from './styles/ColumnPickerControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

// Higher than this codebase's usual z-index: 2000 "float above everything"
// convention (e.g. DataTable.module.css's .topTooltipContent), since the
// overlay must render above the popover itself, which relies on that same
// convention for its own stacking.
const DRAG_OVERLAY_Z_INDEX = 2100

const noop = () => {}

// Shared visual content for a column row - used both by the interactive
// ColumnRow (which wraps it with useSortable's drag styling) and by the
// DragOverlay preview, so the dragged clone can never visually drift from
// the real row it's standing in for. dragHandleProps/onToggle* are omitted
// for the (non-interactive) overlay preview, and dataTestSuffix keeps its
// data-test ids from colliding with the real row's while both are mounted
// during an active drag.
const ColumnRowFields = ({
    header,
    isVisible,
    isPinned,
    dragHandleProps,
    dataTestSuffix = '',
    suppressTooltips = false,
    onToggleVisible = noop,
    onTogglePinned = noop,
}) => {
    const dragLabel = i18n.t('Drag to reorder')
    const pinLabel = isPinned
        ? i18n.t('Unpin column')
        : i18n.t('Pin column to the left')

    // While a drag is in progress, the cursor keeps passing over every
    // row's drag handle/pin button - those still fire real mouseover
    // events, so without this guard, other rows' tooltips would pop open
    // mid-drag. Not rendering the Tooltip wrapper (rather than e.g. hiding
    // its content) also unmounts any tooltip that was already open.
    const dragIcon = <IconDragHandle16 />
    const pinIcon = isPinned ? <IconLock16 /> : <IconLockOpen16 />

    return (
        <>
            <button
                type="button"
                className={cx(styles.rowIconButton, styles.dragHandle)}
                aria-label={dragLabel}
                data-test={`data-table-column-picker-drag-${header.dataKey}${dataTestSuffix}`}
                draggable={false}
                {...dragHandleProps}
            >
                {suppressTooltips ? (
                    dragIcon
                ) : (
                    <Tooltip content={dragLabel} placement="top">
                        {dragIcon}
                    </Tooltip>
                )}
            </button>
            <Checkbox
                label={
                    <span className={styles.columnRowLabel}>{header.name}</span>
                }
                checked={isVisible}
                onChange={(checked) => onToggleVisible(header.dataKey, checked)}
                className={styles.columnRowCheckbox}
                dataTest={`data-table-column-picker-visible-${header.dataKey}${dataTestSuffix}`}
            />
            <button
                type="button"
                className={cx(styles.rowIconButton, styles.pinButton, {
                    [styles.pinButtonActive]: isPinned,
                })}
                aria-label={pinLabel}
                data-test={`data-table-column-picker-pin-${header.dataKey}${dataTestSuffix}`}
                onClick={() => onTogglePinned(header.dataKey)}
            >
                {suppressTooltips ? (
                    pinIcon
                ) : (
                    <Tooltip content={pinLabel} placement="top">
                        {pinIcon}
                    </Tooltip>
                )}
            </button>
        </>
    )
}

ColumnRowFields.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    isPinned: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    dataTestSuffix: PropTypes.string,
    dragHandleProps: PropTypes.object,
    suppressTooltips: PropTypes.bool,
    onTogglePinned: PropTypes.func,
    onToggleVisible: PropTypes.func,
}

const ColumnRow = ({
    header,
    isVisible,
    isPinned,
    isPinnedGroupEnd,
    isDragActive,
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cx(styles.columnRow, {
                [styles.columnRowDivider]: isPinnedGroupEnd,
            })}
        >
            <ColumnRowFields
                header={header}
                isVisible={isVisible}
                isPinned={isPinned}
                dragHandleProps={{ ...attributes, ...listeners }}
                suppressTooltips={isDragActive}
                onToggleVisible={onToggleVisible}
                onTogglePinned={onTogglePinned}
            />
        </div>
    )
}

ColumnRow.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    isDragActive: PropTypes.bool.isRequired,
    isPinned: PropTypes.bool.isRequired,
    isPinnedGroupEnd: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onTogglePinned: PropTypes.func.isRequired,
    onToggleVisible: PropTypes.func.isRequired,
}

const ColumnPickerControl = ({ layerId, allHeaders, columnConfig }) => {
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

    // Mirrors DataTable.jsx's pinnedColumnCount: getVisibleHeaders already
    // moves pinned columns to the front, so the pinned group's size is just
    // how many headers match pinnedKeys before the first one that doesn't.
    let pinnedCount = 0
    for (const header of orderedHeaders) {
        if (!pinnedKeys.includes(header.dataKey)) {
            break
        }
        pinnedCount++
    }

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
            <ToolbarIconButton
                ref={anchorRef}
                tooltip={i18n.t('Configure columns')}
                ariaLabel={i18n.t('Configure columns')}
                dataTest="data-table-column-picker-button"
                disabled={!headers.length}
                onClick={() => setIsOpen((o) => !o)}
            >
                <IconLayoutColumns16 />
            </ToolbarIconButton>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement={dropdownPlacement}
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.columnPickerPopover}>
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
                                    {orderedHeaders.map((header, index) => (
                                        <ColumnRow
                                            key={header.dataKey}
                                            header={header}
                                            isVisible={visibleKeys.includes(
                                                header.dataKey
                                            )}
                                            isPinned={pinnedKeys.includes(
                                                header.dataKey
                                            )}
                                            isPinnedGroupEnd={
                                                index === pinnedCount - 1 &&
                                                pinnedCount <
                                                    orderedHeaders.length
                                            }
                                            isDragActive={activeId != null}
                                            onToggleVisible={onToggleVisible}
                                            onTogglePinned={onTogglePinned}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            {createPortal(
                                // DragOverlay renders inline wherever it's
                                // placed and relies on `position: fixed` to
                                // escape into the viewport - but it's nested
                                // inside FilterDropdownPopover's Popper,
                                // which positions itself via a CSS
                                // `transform`. A `transform` on an ancestor
                                // creates a new containing block for
                                // `position: fixed` descendants, so without
                                // this portal the overlay ends up positioned
                                // relative to the popover instead of the
                                // viewport (rendering off-screen or hidden).
                                <DragOverlay
                                    modifiers={[restrictToVerticalAxis]}
                                    zIndex={DRAG_OVERLAY_Z_INDEX}
                                >
                                    {activeHeader ? (
                                        <div
                                            className={cx(
                                                styles.columnRow,
                                                styles.dragOverlay
                                            )}
                                        >
                                            <ColumnRowFields
                                                header={activeHeader}
                                                isVisible={visibleKeys.includes(
                                                    activeHeader.dataKey
                                                )}
                                                isPinned={pinnedKeys.includes(
                                                    activeHeader.dataKey
                                                )}
                                                dataTestSuffix="-preview"
                                                suppressTooltips
                                            />
                                        </div>
                                    ) : null}
                                </DragOverlay>,
                                document.body
                            )}
                        </DndContext>
                    </div>
                </FilterDropdownPopover>
            )}
        </>
    )
}

ColumnPickerControl.propTypes = {
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

export default ColumnPickerControl
