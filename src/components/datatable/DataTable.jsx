import i18n from '@dhis2/d2-i18n'
import {
    DataTableRow,
    DataTableColumnHeader,
    ComponentCover,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, {
    useReducer,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { highlightFeature } from '../../actions/feature.js'
import { editLayer, setForceClientCluster } from '../../actions/layers.js'
import { SORT_ASCENDING } from '../../constants/dataTable.js'
import {
    getNextSorting,
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
import { SortIcon } from '../core/icons.jsx'
import FilterInput from './FilterInput.jsx'
import RowCells from './RowCells.jsx'
import styles from './styles/DataTable.module.css'
import TableComponents from './TableVirtuosoComponents.jsx'
import TopTooltip from './TopTooltip.jsx'
import { useColumnWidths } from './useColumnWidths.js'
import { useTableData } from './useTableData.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const VIEWPORT_OVERSCAN = { top: 400, bottom: 400 }

const Table = ({
    availableWidth,
    onCountChange,
    onHeadersChange,
    onClearFilters,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const virtuosoRef = useRef(null)
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: 'name',
            sortDirection: SORT_ASCENDING,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)

    const sortData = useCallback(
        ({ name }) => {
            setSorting(getNextSorting(name, { sortField, sortDirection }))
        },
        [sortField, sortDirection]
    )

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

    useEffect(() => {
        onCountChange?.(totalCount, filteredCount)
    }, [onCountChange, totalCount, filteredCount])

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

    const computeItemKey = useCallback(
        (index, row) => getRowId(row) ?? index,
        []
    )

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow ref={headerRowRef}>
                {visibleHeaders.map(
                    ({ name, dataKey, type, optionSet, renderer }, index) => {
                        const { fixed, left, isLastPinned } =
                            getPinnedCellProps(dataKey, index, {
                                pinnedLeftOffsets,
                                pinnedColumnCount,
                                columnWidths,
                            })
                        return (
                            <DataTableColumnHeader
                                className={cx(styles.columnHeader, {
                                    [styles.pinnedColumnShadow]: isLastPinned,
                                })}
                                key={`${dataKey}-${index}`}
                                fixed={fixed}
                                left={left}
                                onFilterIconClick={
                                    isFilterable(dataKey, type) &&
                                    Function.prototype
                                }
                                showFilter={isFilterable(dataKey, type)}
                                name={dataKey}
                                filter={
                                    isFilterable(dataKey, type) && (
                                        <FilterInput
                                            type={type}
                                            dataKey={dataKey}
                                            name={name}
                                            options={columnOptions[dataKey]}
                                            optionSetId={optionSet?.id}
                                            renderer={renderer}
                                            orgUnitIdToName={orgUnitIdToName}
                                        />
                                    )
                                }
                                width={
                                    columnWidths.length > 0
                                        ? `${columnWidths[index]}px`
                                        : 'auto'
                                }
                            >
                                <span className={styles.headerContent}>
                                    <span className={styles.headerTitle}>
                                        {name}
                                    </span>
                                    <TopTooltip
                                        content={i18n.t('Sort by {{column}}', {
                                            column: name,
                                        })}
                                    >
                                        <button
                                            type="button"
                                            className={styles.sortButton}
                                            aria-label={i18n.t(
                                                'Sort by {{column}}',
                                                { column: name }
                                            )}
                                            data-test={`data-table-column-sort-button-${name}`}
                                            onClick={() =>
                                                sortData({
                                                    name: dataKey,
                                                })
                                            }
                                        >
                                            <SortIcon
                                                direction={
                                                    dataKey === sortField
                                                        ? sortDirection
                                                        : null
                                                }
                                            />
                                        </button>
                                    </TopTooltip>
                                </span>
                            </DataTableColumnHeader>
                        )
                    }
                )}
            </DataTableRow>
        ),
        [
            sortData,
            sortField,
            sortDirection,
            visibleHeaders,
            pinnedLeftOffsets,
            pinnedColumnCount,
            columnWidths,
            columnOptions,
            headerRowRef,
            orgUnitIdToName,
        ]
    )

    const itemContent = useCallback(
        (_, row) => (
            <RowCells
                row={row}
                visibleHeaders={visibleHeaders}
                hoveredFeature={feature}
                layerId={layer.id}
                pinnedLeftOffsets={pinnedLeftOffsets}
                pinnedColumnCount={pinnedColumnCount}
                columnWidths={columnWidths}
                rendererByDataKey={rendererByDataKey}
                typeByDataKey={typeByDataKey}
                keyAnalysisDigitGroupSeparator={keyAnalysisDigitGroupSeparator}
                orgUnitIdToName={orgUnitIdToName}
            />
        ),
        [
            visibleHeaders,
            feature,
            layer.id,
            pinnedLeftOffsets,
            pinnedColumnCount,
            columnWidths,
            rendererByDataKey,
            typeByDataKey,
            keyAnalysisDigitGroupSeparator,
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
                itemContent={itemContent}
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
        </>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
    onClearFilters: PropTypes.func,
    onCountChange: PropTypes.func,
    onHeadersChange: PropTypes.func,
}

export default Table
