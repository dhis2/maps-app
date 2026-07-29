import React, {
    useRef,
    useCallback,
    useMemo,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearDataFilters } from '../../actions/dataFilters.js'
import {
    closeDataTable,
    resizeDataTable,
    toggleShowOnlyFeaturesInView,
    setSelectionFilter,
    setHighlightColor,
    toggleDataTable,
    toggleCombinedView,
    setJoinConfig,
    setDataTableColumnConfig,
} from '../../actions/dataTable.js'
import { COMBINED_HEADERS_KEY } from '../../constants/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getOrgUnitsFromRows } from '../../util/analytics.js'
import {
    getEligibleDataTableLayers,
    getPanelHeights,
    hasActiveDataTableFilters,
} from '../../util/dataTable.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import CombinedDataTable from './CombinedDataTable.jsx'
import ClearFiltersControl from './controls/ClearFiltersControl.jsx'
import CloseControl from './controls/CloseControl.jsx'
import CollapseControl from './controls/CollapseControl.jsx'
import ColumnPickerControl from './controls/ColumnPickerControl.jsx'
import GlobalSearchControl from './controls/GlobalSearchControl.jsx'
import HighlightColorControl from './controls/HighlightColorControl.jsx'
import JoinLayersControl from './controls/JoinLayersControl.jsx'
import LayerSelectorControl from './controls/LayerSelectorControl.jsx'
import ReferenceOrgUnitControl, {
    useReferenceLayer,
} from './controls/ReferenceOrgUnitControl.jsx'
import ResizeHandleControl from './controls/ResizeHandleControl.jsx'
import RowCountControl from './controls/RowCountControl.jsx'
import ShowInViewControl from './controls/ShowInViewControl.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import styles from './styles/BottomPanel.module.css'

const MIN_HEIGHT = 50
const EMPTY_FILTERS = {}
const EMPTY_JOIN_LAYERS = {}

const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const { openIds, combinedView, joinConfig } = useSelector(
        (state) => state.dataTable
    )
    const mapViews = useSelector((state) => state.map.mapViews)
    // Only tracks a user's explicit tab click - falls back to the most
    // recently opened tab whenever it doesn't (yet) name an open layer, so
    // there's no render where this is out of sync with openIds (unlike a
    // useState+useEffect pair, which would flash a stale/null value for one
    // render before the effect corrects it).
    const [manualActiveLayerId, setManualActiveLayerId] = useState(null)
    const activeLayerId =
        manualActiveLayerId && openIds.includes(manualActiveLayerId)
            ? manualActiveLayerId
            : openIds[openIds.length - 1] ?? null

    const eligibleLayers = getEligibleDataTableLayers(mapViews)
    const { referenceLayer, openReferenceLayerEditor } = useReferenceLayer()
    const combinedEnabled =
        !!referenceLayer && getOrgUnitsFromRows(referenceLayer.rows).length > 0

    const joinLayersConfig = joinConfig.layers ?? EMPTY_JOIN_LAYERS
    const combinedLayers = useMemo(
        () => mapViews.filter((l) => joinLayersConfig[l.id]),
        [mapViews, joinLayersConfig]
    )

    const activeLayer = mapViews.find((l) => l.id === activeLayerId)
    const dataFilters = activeLayer?.dataFilters ?? EMPTY_FILTERS
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
    const highlightColor = useSelector((state) => state.ui.highlightColor)

    const dispatch = useDispatch()
    const { height } = useWindowDimensions()
    const panelRef = useRef(null)
    const isDraggingRef = useRef(false)
    const preDragCollapsedRef = useRef(false)
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [globalSearch, setGlobalSearch] = useState('')
    const [headersByLayer, setHeadersByLayer] = useState(null)
    const [combinedFilters, setCombinedFilters] = useState(EMPTY_FILTERS)
    // Session-only, never persisted or dispatched to Redux - matches
    // combinedFilters/joinConfig's existing ephemeral scope for the
    // Combined view.
    const [combinedColumnConfig, setCombinedColumnConfig] = useState(null)

    const hasActiveFilters = combinedView
        ? Object.keys(combinedFilters).length > 0 ||
          !!globalSearch.trim() ||
          showOnlyFeaturesInView ||
          !!selectionFilter?.length
        : hasActiveDataTableFilters({
              dataFilters,
              globalSearch,
              selectionFilter,
              showOnlyFeaturesInView,
          })

    const { maxHeight, collapsedHeight, displayHeight } = getPanelHeights({
        windowHeight: height,
        dataTableHeight,
        isCollapsed,
        headerHeight: getCssVar('--header-height'),
        toolbarHeight: getCssVar('--toolbar-height'),
        controlsHeight: getCssVar('--data-table-controls-height'),
    })

    const toggleCollapsed = useCallback(
        () => setIsCollapsed((collapsed) => !collapsed),
        []
    )

    const onControlsDoubleClick = useCallback(
        (e) => {
            if (e.target.closest('button, input, label, select')) {
                return
            }
            toggleCollapsed()
        },
        [toggleCollapsed]
    )

    const onResizeStart = useCallback(() => {
        isDraggingRef.current = true
        preDragCollapsedRef.current = isCollapsed
    }, [isCollapsed])

    const onResize = useCallback(
        (h) => {
            setIsCollapsed(h <= MIN_HEIGHT)
            document.documentElement.style.setProperty(
                '--data-table-height',
                `${h <= MIN_HEIGHT ? collapsedHeight : h}px`
            )
        },
        [collapsedHeight]
    )

    const onResizeEnd = useCallback(
        (h) => {
            isDraggingRef.current = false
            if (h <= MIN_HEIGHT) {
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
                dispatch(resizeDataTable(h))
            }
        },
        [dispatch]
    )

    const onResizeCancel = useCallback(() => {
        isDraggingRef.current = false
        setIsCollapsed(preDragCollapsedRef.current)
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${displayHeight}px`
        )
    }, [displayHeight])

    const onCountChange = useCallback((total, filtered) => {
        setTotalCount(total)
        setFilteredCount(filtered)
    }, [])

    const onHeadersChange = useCallback((headers, layerId) => {
        setHeadersByLayer({ layerId, headers })
    }, [])

    const activeHeadersKey = combinedView ? COMBINED_HEADERS_KEY : activeLayerId
    const allHeaders =
        headersByLayer?.layerId === activeHeadersKey
            ? headersByLayer.headers
            : null

    const onClearFilters = useCallback(() => {
        if (combinedView) {
            setCombinedFilters(EMPTY_FILTERS)
        } else {
            dispatch(clearDataFilters(activeLayerId))
        }
        if (showOnlyFeaturesInView) {
            dispatch(toggleShowOnlyFeaturesInView())
        }
        if (selectionFilter?.length) {
            dispatch(setSelectionFilter([]))
        }
        setGlobalSearch('')
    }, [
        dispatch,
        activeLayerId,
        showOnlyFeaturesInView,
        selectionFilter,
        combinedView,
    ])

    const onToggleShowOnlyFeaturesInView = useCallback(() => {
        dispatch(toggleShowOnlyFeaturesInView())
    }, [dispatch])

    const onCloseDataTable = useCallback(() => {
        dispatch(closeDataTable())
    }, [dispatch])

    const onHighlightColorChange = useCallback(
        (color) => dispatch(setHighlightColor(color)),
        [dispatch]
    )

    useLayoutEffect(() => {
        if (isDraggingRef.current) {
            return
        }
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${displayHeight}px`
        )
    }, [displayHeight])

    useLayoutEffect(
        () => () =>
            document.documentElement.style.removeProperty(
                '--data-table-height'
            ),
        []
    )

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (panelRef.current) {
                setPanelWidth(panelRef.current.getBoundingClientRect().width)
            }
        })
        if (panelRef.current) {
            observer.observe(panelRef.current)
        }
        return () => observer.disconnect()
    }, [])

    const hasHydratedJoinConfigRef = useRef(false)
    useEffect(() => {
        if (
            hasHydratedJoinConfigRef.current ||
            !referenceLayer?.isLoaded ||
            !referenceLayer.combinedJoinConfig
        ) {
            return
        }
        hasHydratedJoinConfigRef.current = true
        dispatch(setJoinConfig({ layers: referenceLayer.combinedJoinConfig }))
    }, [referenceLayer, dispatch])

    useKeyDown('Escape', onCloseDataTable, true)

    return (
        <div
            ref={panelRef}
            className={styles.bottomPanel}
            data-test="bottom-panel"
        >
            <div
                className={styles.dataTableControls}
                onDoubleClick={onControlsDoubleClick}
            >
                <CollapseControl
                    isCollapsed={isCollapsed}
                    onClick={toggleCollapsed}
                />
                <span className={styles.divider} />
                <LayerSelectorControl
                    layers={eligibleLayers}
                    activeLayerId={activeLayerId}
                    combinedView={combinedView}
                    onSelectLayer={(id) => {
                        setManualActiveLayerId(id)
                        if (combinedView) {
                            dispatch(toggleCombinedView())
                        }
                        if (!openIds.includes(id)) {
                            dispatch(toggleDataTable(id))
                        }
                    }}
                    onSelectCombined={() => {
                        if (!combinedView) {
                            dispatch(toggleCombinedView())
                        }
                        if (!combinedEnabled) {
                            openReferenceLayerEditor()
                        }
                    }}
                />
                <span className={styles.divider} />
                <HighlightColorControl
                    color={highlightColor}
                    onChange={onHighlightColorChange}
                />
                {combinedView ? (
                    <>
                        <ColumnPickerControl
                            allHeaders={allHeaders}
                            columnConfig={combinedColumnConfig}
                            onChange={setCombinedColumnConfig}
                        />
                        <JoinLayersControl
                            eligibleLayers={eligibleLayers}
                            layersConfig={joinLayersConfig}
                            onChange={(layers) =>
                                dispatch(setJoinConfig({ layers }))
                            }
                        />
                        <ReferenceOrgUnitControl />
                        <span className={styles.divider} />
                    </>
                ) : (
                    <>
                        <ColumnPickerControl
                            allHeaders={allHeaders}
                            columnConfig={activeLayer?.dataTableColumnConfig}
                            onChange={(config) =>
                                dispatch(
                                    setDataTableColumnConfig(
                                        activeLayerId,
                                        config
                                    )
                                )
                            }
                        />
                        <span className={styles.divider} />
                    </>
                )}
                <ResizeHandleControl
                    maxHeight={maxHeight}
                    minHeight={MIN_HEIGHT}
                    onResizeStart={onResizeStart}
                    onResize={onResize}
                    onResizeEnd={onResizeEnd}
                    onResizeCancel={onResizeCancel}
                />
                <RowCountControl
                    totalCount={totalCount}
                    filteredCount={filteredCount}
                />
                <span className={styles.divider} />
                <ClearFiltersControl
                    disabled={!hasActiveFilters}
                    onClick={onClearFilters}
                />
                <GlobalSearchControl
                    value={globalSearch}
                    onChange={setGlobalSearch}
                />
                <ShowInViewControl
                    active={showOnlyFeaturesInView}
                    onClick={onToggleShowOnlyFeaturesInView}
                />
                <span className={styles.divider} />
                <CloseControl onClick={onCloseDataTable} />
            </div>
            <div className={styles.tableContainer}>
                <ErrorBoundary>
                    {combinedView ? (
                        <CombinedDataTable
                            availableWidth={panelWidth}
                            layers={combinedLayers}
                            referenceLayer={referenceLayer}
                            joinConfig={joinConfig}
                            filters={combinedFilters}
                            onFiltersChange={setCombinedFilters}
                            globalSearch={globalSearch}
                            onCountChange={onCountChange}
                            onHeadersChange={onHeadersChange}
                            columnConfig={combinedColumnConfig}
                        />
                    ) : (
                        <DataTable
                            activeLayerId={activeLayerId}
                            availableWidth={panelWidth}
                            onCountChange={onCountChange}
                            onHeadersChange={onHeadersChange}
                            globalSearch={globalSearch}
                            onClearFilters={onClearFilters}
                        />
                    )}
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default BottomPanel
