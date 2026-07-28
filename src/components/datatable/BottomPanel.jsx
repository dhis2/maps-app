import i18n from '@dhis2/d2-i18n'
import { TabBar, Tab, IconCross16 } from '@dhis2/ui'
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
import { DATA_TABLE_LAYER_TYPES } from '../../constants/layers.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import {
    getPanelHeights,
    hasActiveDataTableFilters,
} from '../../util/dataTable.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from '../../util/geojson.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import CombinedDataTable from './CombinedDataTable.jsx'
import ActiveLayerControl from './controls/ActiveLayerControl.jsx'
import ClearFiltersControl from './controls/ClearFiltersControl.jsx'
import CloseControl from './controls/CloseControl.jsx'
import CollapseControl from './controls/CollapseControl.jsx'
import ColumnPickerControl from './controls/ColumnPickerControl.jsx'
import GlobalSearchControl from './controls/GlobalSearchControl.jsx'
import HighlightColorControl from './controls/HighlightColorControl.jsx'
import JoinLayersControl from './controls/JoinLayersControl.jsx'
import ResizeHandleControl from './controls/ResizeHandleControl.jsx'
import RowCountControl from './controls/RowCountControl.jsx'
import ShowInViewControl from './controls/ShowInViewControl.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import styles from './styles/BottomPanel.module.css'

const MIN_HEIGHT = 50
const EMPTY_FILTERS = {}

const isPointLayer = (layer) =>
    layer.data?.[0]?.geometry?.type === GEO_TYPE_POINT

const isPolygonLayer = (layer) =>
    [GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(
        layer.data?.[0]?.geometry?.type
    )

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

    const openLayers = mapViews.filter((l) => openIds.includes(l.id))
    const eligibleLayers = mapViews.filter(
        (l) => DATA_TABLE_LAYER_TYPES.includes(l.layer) && l.data?.length
    )
    const showCombinedTab = eligibleLayers.length >= 2
    const showTabBar = openIds.length > 1 || showCombinedTab

    const pointLayers = eligibleLayers.filter(isPointLayer)
    const polygonLayers = eligibleLayers.filter(isPolygonLayer)
    const hasSpatialCandidates =
        pointLayers.length > 0 && polygonLayers.length > 0

    const { level, layerIds, pointLayerId, polygonLayerId } = joinConfig
    const combinedLayers = useMemo(
        () =>
            level === 'spatial'
                ? [pointLayerId, polygonLayerId]
                      .map((id) => mapViews.find((l) => l.id === id))
                      .filter(Boolean)
                : mapViews.filter((l) => layerIds.includes(l.id)),
        [level, layerIds, pointLayerId, polygonLayerId, mapViews]
    )

    const activeLayer = openLayers.find((l) => l.id === activeLayerId)
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
        ? Object.keys(combinedFilters).length > 0 || !!globalSearch.trim()
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
            if (e.target.closest('button, input, label')) {
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

    const allHeaders =
        headersByLayer?.layerId ===
        (combinedView ? COMBINED_HEADERS_KEY : activeLayerId)
            ? headersByLayer.headers
            : null

    const onClearFilters = useCallback(() => {
        if (combinedView) {
            setCombinedFilters(EMPTY_FILTERS)
        } else {
            dispatch(clearDataFilters(activeLayerId))
            dispatch(setSelectionFilter([]))
            if (showOnlyFeaturesInView) {
                dispatch(toggleShowOnlyFeaturesInView())
            }
        }
        setGlobalSearch('')
    }, [dispatch, activeLayerId, showOnlyFeaturesInView, combinedView])

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
                <ActiveLayerControl name={activeLayer?.name} />
                <span className={styles.divider} />
                {combinedView ? (
                    <>
                        <select
                            className={styles.joinSelect}
                            value={joinConfig.level}
                            onChange={(e) =>
                                dispatch(
                                    setJoinConfig({
                                        ...joinConfig,
                                        level: e.target.value,
                                    })
                                )
                            }
                        >
                            <option value="orgUnit">
                                {i18n.t('Join by org unit')}
                            </option>
                            <option value="parentOrgUnit">
                                {i18n.t('Join by parent org unit')}
                            </option>
                            {hasSpatialCandidates && (
                                <option value="spatial">
                                    {i18n.t('Spatial - point inside polygon')}
                                </option>
                            )}
                        </select>
                        {joinConfig.level === 'spatial' ? (
                            <>
                                <select
                                    className={styles.joinSelect}
                                    value={joinConfig.pointLayerId ?? ''}
                                    onChange={(e) =>
                                        dispatch(
                                            setJoinConfig({
                                                ...joinConfig,
                                                pointLayerId: e.target.value,
                                            })
                                        )
                                    }
                                >
                                    <option value="" disabled>
                                        {i18n.t('Point layer')}
                                    </option>
                                    {pointLayers.map((lyr) => (
                                        <option key={lyr.id} value={lyr.id}>
                                            {lyr.name}
                                        </option>
                                    ))}
                                </select>
                                <span>{i18n.t('inside')}</span>
                                <select
                                    className={styles.joinSelect}
                                    value={joinConfig.polygonLayerId ?? ''}
                                    onChange={(e) =>
                                        dispatch(
                                            setJoinConfig({
                                                ...joinConfig,
                                                polygonLayerId: e.target.value,
                                            })
                                        )
                                    }
                                >
                                    <option value="" disabled>
                                        {i18n.t('Polygon layer')}
                                    </option>
                                    {polygonLayers.map((lyr) => (
                                        <option key={lyr.id} value={lyr.id}>
                                            {lyr.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <JoinLayersControl
                                eligibleLayers={eligibleLayers}
                                selectedIds={joinConfig.layerIds}
                                onChange={(layerIds) =>
                                    dispatch(
                                        setJoinConfig({
                                            ...joinConfig,
                                            layerIds,
                                        })
                                    )
                                }
                            />
                        )}
                        <ColumnPickerControl
                            allHeaders={allHeaders}
                            columnConfig={combinedColumnConfig}
                            onChange={setCombinedColumnConfig}
                        />
                        <span className={styles.divider} />
                    </>
                ) : (
                    <>
                        <HighlightColorControl
                            color={highlightColor}
                            onChange={onHighlightColorChange}
                        />
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
                {!combinedView && (
                    <ShowInViewControl
                        active={showOnlyFeaturesInView}
                        onClick={onToggleShowOnlyFeaturesInView}
                    />
                )}
                <span className={styles.divider} />
                <CloseControl onClick={onCloseDataTable} />
            </div>
            {showTabBar && (
                <TabBar scrollable className={styles.tabBar}>
                    {openLayers.map((lyr) => (
                        <Tab
                            key={lyr.id}
                            selected={!combinedView && lyr.id === activeLayerId}
                            onClick={() => {
                                setManualActiveLayerId(lyr.id)
                                if (combinedView) {
                                    dispatch(toggleCombinedView())
                                }
                            }}
                        >
                            <span className={styles.tabLabel}>{lyr.name}</span>
                            {/* A real <button> can't nest here - Tab's own
                                root element is already a <button>. */}
                            <span
                                role="button"
                                tabIndex={0}
                                className={styles.tabCloseButton}
                                aria-label={i18n.t('Close {{name}} tab', {
                                    name: lyr.name,
                                })}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(toggleDataTable(lyr.id))
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        dispatch(toggleDataTable(lyr.id))
                                    }
                                }}
                            >
                                <IconCross16 />
                            </span>
                        </Tab>
                    ))}
                    {showCombinedTab && (
                        <Tab
                            selected={combinedView}
                            onClick={() => {
                                if (!combinedView) {
                                    dispatch(toggleCombinedView())
                                }
                            }}
                        >
                            {i18n.t('Combined')}
                        </Tab>
                    )}
                </TabBar>
            )}
            <div className={styles.tableContainer}>
                <ErrorBoundary>
                    {combinedView ? (
                        <CombinedDataTable
                            availableWidth={panelWidth}
                            layers={combinedLayers}
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
