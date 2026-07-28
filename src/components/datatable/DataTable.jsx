import i18n from '@dhis2/d2-i18n'
import {
    DataTableRow,
    DataTableCell,
    ComponentCover,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import { setSelectionFilter } from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'
import { editLayer, setForceClientCluster } from '../../actions/layers.js'
import {
    toggleFeatureSelection,
    selectFeatureRange,
    selectAllFeatures,
    clearSelection,
} from '../../actions/selection.js'
import {
    SENTINEL_SELECTED_ROW,
    ORG_UNIT_ID_DATA_KEY,
} from '../../constants/dataTable.js'
import { isDarkColor } from '../../util/colors.js'
import {
    buildFeatureIndex,
    getRowId,
    hasActiveDataTableFilters,
    isFilterable,
    shouldClearFeatureHighlight,
} from '../../util/dataTable.js'
import {
    getPinnedCellProps,
    getPinnedCount,
    getPinnedLeftOffsets,
    getVisibleHeaders,
} from '../../util/tableColumns.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import CellValue, { getCellRendererFlags } from './CellValue.jsx'
import FilterInput from './FilterInput.jsx'
import {
    SelectionCheckboxHeaderCell,
    SelectionCheckboxCell,
} from './SelectionCheckboxColumn.jsx'
import SelectionFilterButton from './SelectionFilterButton.jsx'
import SortableColumnHeader from './SortableColumnHeader.jsx'
import styles from './styles/DataTable.module.css'
import TableContextMenu from './TableContextMenu.jsx'
import TableComponents from './TableVirtuosoComponents.jsx'
import { useColumnWidths } from './useColumnWidths.js'
import { useRowClickSelection } from './useRowClickSelection.js'
import { useRowSelection } from './useRowSelection.js'
import { useSortState } from './useSortState.js'
import { useTableData } from './useTableData.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const VIEWPORT_OVERSCAN = { top: 400, bottom: 400 }

const Table = ({
    activeLayerId,
    availableWidth,
    onCountChange,
    onHeadersChange,
    globalSearch,
    onClearFilters,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const virtuosoRef = useRef(null)
    const { mapViews } = useSelector((state) => state.map)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const selection = useSelector((state) => state.selection)
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const mapBounds = useSelector((state) => state.ui.mapBounds)
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
    const { sortField, sortDirection, sortData } = useSortState('name')

    const layer = mapViews.find((l) => l.id === activeLayerId)

    // Read via ref rather than a dependency, so this callback stays stable
    // across hovers instead of getting a new identity on every single mouse-enter
    const featureRef = useRef(feature)
    featureRef.current = feature

    const setFeatureHighlight = useCallback(
        (row) => {
            const id = getRowId(row)
            const currentFeature = featureRef.current

            if (!id || !currentFeature || id !== currentFeature.id) {
                dispatch(
                    highlightFeature(
                        id
                            ? {
                                  id,
                                  layerId: layer.id,
                                  origin: 'table',
                              }
                            : null
                    )
                )
            }
        },
        [dispatch, layer.id]
    )
    const clearFeatureHighlight = useCallback(
        (event) => {
            if (shouldClearFeatureHighlight(event)) {
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const featureById = useMemo(
        () => buildFeatureIndex(layer.data),
        [layer.data]
    )

    const [tableContextMenu, setTableContextMenu] = useState(null)

    const onRowContextMenu = useCallback(
        (e, row) => {
            e.preventDefault()
            const id = getRowId(row)
            const feature = featureById.get(id)
            setTableContextMenu({
                x: e.clientX,
                y: e.clientY,
                featureProps: feature?.properties ?? { id },
            })
        },
        [featureById]
    )

    const selectedIds = useMemo(
        () => (selection.layerId === layer.id ? selection.ids : []),
        [selection, layer.id]
    )
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

    const {
        headers,
        rows,
        isLoading,
        loadingReason,
        error,
        totalCount,
        filteredCount,
        columnOptions,
        orgUnitIdToName,
    } = useTableData({
        layer,
        sortField,
        sortDirection,
        showOnlyFeaturesInView,
        mapBounds,
        selectionFilter,
        selectedIdSet,
        globalSearch,
        keyAnalysisDigitGroupSeparator,
    })

    useEffect(() => {
        onHeadersChange?.(headers, layer.id)
    }, [onHeadersChange, headers, layer.id])

    const columnConfig = layer.dataTableColumnConfig
    const pinnedKeys = useMemo(
        () => columnConfig?.pinnedKeys ?? [],
        [columnConfig]
    )

    const visibleHeaders = useMemo(
        () => getVisibleHeaders(headers, columnConfig) ?? [],
        [headers, columnConfig]
    )

    const rendererByDataKey = useMemo(
        () => new Map(visibleHeaders.map((h) => [h.dataKey, h.renderer])),
        [visibleHeaders]
    )

    const typeByDataKey = useMemo(
        () => new Map(visibleHeaders.map((h) => [h.dataKey, h.type])),
        [visibleHeaders]
    )

    const { headerRowRef, columnWidths } = useColumnWidths({
        availableWidth,
        headers: visibleHeaders,
        error,
    })

    const pinnedColumnCount = useMemo(
        () => getPinnedCount(visibleHeaders, pinnedKeys),
        [visibleHeaders, pinnedKeys]
    )

    const pinnedLeftOffsets = useMemo(
        () => getPinnedLeftOffsets(visibleHeaders, pinnedKeys, columnWidths),
        [visibleHeaders, pinnedKeys, columnWidths]
    )
    const pinnedOffsetsReady = Object.keys(pinnedLeftOffsets).length > 0

    const isCheckboxColumnPinned = pinnedColumnCount > 0 && pinnedOffsetsReady

    useEffect(() => {
        onCountChange?.(totalCount, filteredCount)
    }, [onCountChange, totalCount, filteredCount])

    const onToggleRow = useCallback(
        (id) => dispatch(toggleFeatureSelection(id, layer.id)),
        [dispatch, layer.id]
    )
    const onSelectRowRange = useCallback(
        (ids) => dispatch(selectFeatureRange(ids, layer.id)),
        [dispatch, layer.id]
    )
    const onRowClick = useRowClickSelection({
        rows,
        onToggle: onToggleRow,
        onSelectRange: onSelectRowRange,
    })

    const onRowDoubleClick = useCallback(
        (row) => {
            const id = getRowId(row)

            if (!id) {
                return
            }

            dispatch(
                highlightFeature({
                    id,
                    layerId: layer.id,
                    origin: 'table',
                    zoom: true,
                })
            )
        },
        [dispatch, layer.id]
    )

    const hasActiveFilters = hasActiveDataTableFilters({
        dataFilters: layer.dataFilters,
        globalSearch,
        selectionFilter,
        showOnlyFeaturesInView,
    })

    const showServerClusterAction =
        layer.serverCluster && !layer.forceClientCluster

    const onForceClientCluster = useCallback(
        () => dispatch(setForceClientCluster(layer.id)),
        [dispatch, layer.id]
    )

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            onContextMenu: onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
            totalCount,
            hasActiveFilters,
            onClearFilters,
            showServerClusterAction,
            onForceClientCluster,
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            columnWidths,
            totalCount,
            hasActiveFilters,
            onClearFilters,
            showServerClusterAction,
            onForceClientCluster,
        ]
    )

    const lastClickedFeature = useSelector(
        (state) => state.ui.lastClickedFeature
    )
    const rowsRef = useRef(rows)
    rowsRef.current = rows
    useEffect(() => {
        if (!lastClickedFeature || lastClickedFeature.layerId !== layer.id) {
            return
        }
        const currentRows = rowsRef.current
        if (!currentRows) {
            return
        }
        const rowIndex = currentRows.findIndex(
            (row) => getRowId(row) === lastClickedFeature.id
        )
        if (rowIndex !== -1) {
            virtuosoRef.current?.scrollToIndex({
                index: rowIndex,
                align: 'center',
                behavior: 'smooth',
            })
        }
    }, [lastClickedFeature, layer.id])

    const allRowIds = useMemo(
        () => rows?.map(getRowId).filter(Boolean) ?? [],
        [rows]
    )

    const onSelectionChange = useCallback(
        (nextIds) => {
            if (nextIds.length) {
                dispatch(selectAllFeatures(nextIds, layer.id))
            } else {
                dispatch(clearSelection())
            }
        },
        [dispatch, layer.id]
    )

    const { isAllSelected, onToggleSelectAll, onReverseSelection } =
        useRowSelection({
            selectedIds,
            selectedIdSet,
            allRowIds,
            onChange: onSelectionChange,
        })

    const computeItemKey = useCallback(
        (index, row) => getRowId(row) ?? index,
        []
    )

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow ref={headerRowRef}>
                <SelectionCheckboxHeaderCell
                    fixed={isCheckboxColumnPinned}
                    left={isCheckboxColumnPinned ? '0px' : undefined}
                    isAllSelected={isAllSelected}
                    onToggleSelectAll={onToggleSelectAll}
                    onReverseSelection={onReverseSelection}
                    disabled={allRowIds.length === 0}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortBySelected={() =>
                        sortData({ name: SENTINEL_SELECTED_ROW })
                    }
                    onFilterIconClick={Function.prototype}
                    showFilter={true}
                    filter={
                        <SelectionFilterButton
                            value={selectionFilter ?? []}
                            onChange={(next) =>
                                dispatch(setSelectionFilter(next))
                            }
                        />
                    }
                />
                {visibleHeaders.map(
                    ({ name, dataKey, type, optionSet, renderer }, index) => {
                        const { fixed, left, isLastPinned } =
                            getPinnedCellProps(dataKey, index, {
                                pinnedLeftOffsets,
                                pinnedColumnCount,
                                columnWidths,
                            })
                        return (
                            <SortableColumnHeader
                                key={`${dataKey}-${index}`}
                                name={name}
                                dataKey={dataKey}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={sortData}
                                dataTestPrefix="data-table-column-sort-button"
                                className={cx(styles.columnHeader, {
                                    [styles.pinnedColumnShadow]: isLastPinned,
                                })}
                                fixed={fixed}
                                left={left}
                                onFilterIconClick={
                                    isFilterable(dataKey, type) &&
                                    Function.prototype
                                }
                                showFilter={isFilterable(dataKey, type)}
                                filter={
                                    isFilterable(dataKey, type) && (
                                        <FilterInput
                                            layerId={activeLayerId}
                                            type={type}
                                            dataKey={dataKey}
                                            name={name}
                                            options={columnOptions[dataKey]}
                                            optionSetId={optionSet?.id}
                                            renderer={renderer}
                                            orgUnitIdToName={orgUnitIdToName}
                                            filterValue={
                                                layer.dataFilters?.[dataKey]
                                            }
                                            onChange={(value) =>
                                                dispatch(
                                                    setDataFilter(
                                                        activeLayerId,
                                                        dataKey,
                                                        value
                                                    )
                                                )
                                            }
                                            onClear={() =>
                                                dispatch(
                                                    clearDataFilter(
                                                        activeLayerId,
                                                        dataKey
                                                    )
                                                )
                                            }
                                        />
                                    )
                                }
                                width={
                                    columnWidths.length > 0
                                        ? `${columnWidths[index]}px`
                                        : 'auto'
                                }
                            />
                        )
                    }
                )}
            </DataTableRow>
        ),
        [
            activeLayerId,
            isCheckboxColumnPinned,
            selectionFilter,
            dispatch,
            allRowIds,
            onReverseSelection,
            sortData,
            sortField,
            sortDirection,
            visibleHeaders,
            pinnedLeftOffsets,
            layer.dataFilters,
            pinnedColumnCount,
            columnWidths,
            columnOptions,
            isAllSelected,
            onToggleSelectAll,
            headerRowRef,
            orgUnitIdToName,
        ]
    )

    if (error) {
        return (
            <p className={styles.noSupport}>
                {error}
                <button
                    type="button"
                    className={styles.editLayerLink}
                    onClick={() => dispatch(editLayer(layer))}
                >
                    {i18n.t('Edit layer')}
                </button>
            </p>
        )
    }

    return (
        <>
            <TableVirtuoso
                ref={virtuosoRef}
                context={tableContext}
                components={TableComponents}
                style={TABLE_STYLE}
                data={rows}
                computeItemKey={computeItemKey}
                increaseViewportBy={VIEWPORT_OVERSCAN}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={(_, row) => {
                    const rowId = getRowId(row)
                    const isSelected = !!rowId && selectedIdSet.has(rowId)
                    const isHovered =
                        !!rowId &&
                        feature?.id === rowId &&
                        feature?.layerId === layer.id

                    const cellsByDataKey = new Map(
                        row.map((cell) => [cell.dataKey, cell])
                    )

                    return (
                        <>
                            <SelectionCheckboxCell
                                fixed={isCheckboxColumnPinned}
                                left={
                                    isCheckboxColumnPinned ? '0px' : undefined
                                }
                                width={
                                    isCheckboxColumnPinned ? '76px' : undefined
                                }
                                isSelected={isSelected}
                                isHovered={isHovered}
                                onToggle={() => rowId && onToggleRow(rowId)}
                            />
                            {visibleHeaders.map(({ dataKey }, index) => {
                                const cell = cellsByDataKey.get(dataKey)
                                if (!cell) {
                                    return null
                                }
                                const { value, align } = cell
                                const { fixed, left, width, isLastPinned } =
                                    getPinnedCellProps(dataKey, index, {
                                        pinnedLeftOffsets,
                                        pinnedColumnCount,
                                        columnWidths,
                                    })
                                const renderer = rendererByDataKey.get(dataKey)
                                const type = typeByDataKey.get(dataKey)
                                const { isColorCell } = getCellRendererFlags(
                                    renderer,
                                    type
                                )
                                return (
                                    <DataTableCell
                                        key={`dtcell-${dataKey}`}
                                        staticStyle
                                        fixed={fixed}
                                        left={left}
                                        width={width}
                                        className={cx(styles.dataCell, {
                                            [styles.lightText]:
                                                isColorCell &&
                                                isDarkColor(value),
                                            [styles.monoCell]:
                                                dataKey === 'id' ||
                                                dataKey ===
                                                    ORG_UNIT_ID_DATA_KEY ||
                                                isColorCell,
                                            [styles.selected]:
                                                isSelected && !isColorCell,
                                            [styles.hovered]:
                                                isHovered && !isColorCell,
                                            [styles.pinnedColumnShadow]:
                                                isLastPinned,
                                        })}
                                        backgroundColor={
                                            isColorCell ? value : null
                                        }
                                        align={align}
                                    >
                                        <CellValue
                                            value={value}
                                            renderer={renderer}
                                            type={type}
                                            orgUnitIdToName={orgUnitIdToName}
                                            keyAnalysisDigitGroupSeparator={
                                                keyAnalysisDigitGroupSeparator
                                            }
                                        />
                                    </DataTableCell>
                                )
                            })}
                        </>
                    )
                }}
            />
            {(isLoading || layer?.isLoaded === false || layer?.isLoading) && (
                <ComponentCover translucent>
                    <CenteredContent>
                        <div className={styles.loadingContent}>
                            <CircularLoader invert />
                            {loadingReason && (
                                <span className={styles.loadingReason}>
                                    {loadingReason}
                                </span>
                            )}
                        </div>
                    </CenteredContent>
                </ComponentCover>
            )}
            <TableContextMenu
                contextMenu={tableContextMenu}
                layer={layer}
                selectedIds={selectedIds}
                filteredIds={hasActiveFilters ? allRowIds : null}
                onClose={() => setTableContextMenu(null)}
            />
        </>
    )
}

Table.propTypes = {
    activeLayerId: PropTypes.string,
    availableWidth: PropTypes.number,
    globalSearch: PropTypes.string,
    onClearFilters: PropTypes.func,
    onCountChange: PropTypes.func,
    onHeadersChange: PropTypes.func,
}

export default Table
