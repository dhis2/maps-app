import i18n from '@dhis2/d2-i18n'
import { IconLayoutColumns16, IconSync16, IconUndo16, Tooltip } from '@dhis2/ui'
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { arrayMoveImmutable } from 'array-move'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { setDataTableColumnConfig } from '../../../actions/dataTable.js'
import {
    getPinnedCount,
    getVisibleHeaders,
    isPinnedGroupEnd,
    reverseVisibleKeys,
    togglePinnedKey,
    toggleVisibleKey,
} from '../../../util/tableColumns.js'
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import ColumnRow, { ColumnRowFields } from './ColumnRow.jsx'
import styles from './styles/ColumnPickerControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const DRAG_OVERLAY_Z_INDEX = 2100

const ColumnPickerControl = ({ layerId, allHeaders, columnConfig }) => {
    const dispatch = useDispatch()
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState(null)
    const [search, setSearch] = useState('')
    const [hasScroll, setHasScroll] = useState(false)
    const [popoverWidth, setPopoverWidth] = useState(null)

    useLayoutEffect(() => {
        if (isOpen) {
            setSearch('')
        }
    }, [isOpen])

    const columnListRef = useCallback((el) => {
        if (el) {
            setHasScroll(el.scrollHeight > el.clientHeight)
        }
    }, [])

    const popoverRef = useCallback((el) => {
        if (el) {
            setPopoverWidth(el.offsetWidth)
        }
    }, [])

    const headers = allHeaders ?? []

    const visibleKeys =
        columnConfig?.visibleKeys ?? headers.map((h) => h.dataKey)
    const pinnedKeys = columnConfig?.pinnedKeys ?? []
    const orderedKeys =
        columnConfig?.orderedKeys ?? headers.map((h) => h.dataKey)

    const orderedHeaders = getVisibleHeaders(headers, {
        orderedKeys,
        pinnedKeys,
    })

    const pinnedCount = getPinnedCount(orderedHeaders, pinnedKeys)

    const updateConfig = (partial) =>
        dispatch(
            setDataTableColumnConfig(layerId, {
                visibleKeys,
                pinnedKeys,
                orderedKeys,
                ...partial,
            })
        )

    const onToggleVisible = (dataKey, checked) =>
        updateConfig({
            visibleKeys: toggleVisibleKey(visibleKeys, dataKey, checked),
        })

    const onTogglePinned = (dataKey) =>
        updateConfig({ pinnedKeys: togglePinnedKey(pinnedKeys, dataKey) })

    const isAllVisible = visibleKeys.length === headers.length
    const onToggleSelectAll = () =>
        updateConfig({
            visibleKeys: isAllVisible ? [] : headers.map((h) => h.dataKey),
        })

    const onReverseSelection = () =>
        updateConfig({
            visibleKeys: reverseVisibleKeys(headers, visibleKeys),
        })

    const onResetToDefaults = () =>
        dispatch(setDataTableColumnConfig(layerId, undefined))

    const filteredHeaders = orderedHeaders.filter((h) =>
        h.name.toLowerCase().includes(search.trim().toLowerCase())
    )

    const sensors = useSensors(
        useSensor(MouseSensor, {
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
                    placement="top-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div
                        ref={popoverRef}
                        className={styles.columnPickerPopover}
                        style={
                            popoverWidth != null
                                ? { width: popoverWidth }
                                : undefined
                        }
                    >
                        {hasScroll && (
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder={i18n.t('Search')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                data-test="data-table-column-picker-search"
                            />
                        )}
                        <div className={styles.bulkActionsRow}>
                            <span className={styles.selectAllSpacer} />
                            <Tooltip
                                content={i18n.t('Select all columns')}
                                placement="top"
                            >
                                <input
                                    type="checkbox"
                                    aria-label={i18n.t('Select all columns')}
                                    data-test="data-table-column-picker-select-all"
                                    checked={isAllVisible}
                                    onChange={onToggleSelectAll}
                                />
                            </Tooltip>
                            <ToolbarIconButton
                                tooltip={i18n.t('Reverse selection')}
                                dataTest="data-table-column-picker-reverse"
                                onClick={onReverseSelection}
                            >
                                <IconSync16 />
                            </ToolbarIconButton>
                            <span className={styles.bulkActionsDivider} />
                            <ToolbarIconButton
                                tooltip={i18n.t('Reset to defaults')}
                                dataTest="data-table-column-picker-reset"
                                disabled={!columnConfig}
                                onClick={onResetToDefaults}
                            >
                                <IconUndo16 />
                            </ToolbarIconButton>
                        </div>
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
                                <div
                                    ref={columnListRef}
                                    className={styles.columnList}
                                >
                                    {filteredHeaders.map((header) => (
                                        <ColumnRow
                                            key={header.dataKey}
                                            header={header}
                                            isVisible={visibleKeys.includes(
                                                header.dataKey
                                            )}
                                            isPinned={pinnedKeys.includes(
                                                header.dataKey
                                            )}
                                            isPinnedGroupEnd={isPinnedGroupEnd(
                                                header,
                                                pinnedCount,
                                                orderedHeaders
                                            )}
                                            isDragActive={activeId != null}
                                            onToggleVisible={onToggleVisible}
                                            onTogglePinned={onTogglePinned}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            {createPortal(
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
