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
    setDataTableColumnConfig,
    setActiveDataTableLayer,
} from '../../actions/dataTable.js'
import useDebouncedValue from '../../hooks/useDebouncedValue.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import {
    getEligibleDataTableLayers,
    hasActiveDataTableFilters,
} from '../../util/dataTable.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import ClearFiltersControl from './controls/ClearFiltersControl.jsx'
import CloseControl from './controls/CloseControl.jsx'
import CollapseControl from './controls/CollapseControl.jsx'
import ColumnPickerControl from './controls/ColumnPickerControl.jsx'
import GlobalSearchControl from './controls/GlobalSearchControl.jsx'
import HighlightColorControl from './controls/HighlightColorControl.jsx'
import LayerSelectorControl from './controls/LayerSelectorControl.jsx'
import ResizeHandleControl from './controls/ResizeHandleControl.jsx'
import RowCountControl from './controls/RowCountControl.jsx'
import ShowInViewControl from './controls/ShowInViewControl.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import styles from './styles/BottomPanel.module.css'
import { usePanelHeights } from './usePanelHeights.js'

const MIN_HEIGHT = 50
const EMPTY_FILTERS = {}

const BottomPanel = () => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const { openIds, activeLayerId: storedActiveLayerId } = useSelector(
        (state) => state.dataTable
    )
    const mapViews = useSelector((state) => state.map.mapViews)
    const activeLayerId =
        storedActiveLayerId && openIds.includes(storedActiveLayerId)
            ? storedActiveLayerId
            : openIds[openIds.length - 1] ?? null

    const eligibleLayers = useMemo(() => {
        const loaded = getEligibleDataTableLayers(mapViews).reverse()
        const stillOpen = openIds
            .map((id) => mapViews.find((l) => l.id === id))
            .filter((l) => l && !loaded.some((el) => el.id === l.id))
        return [...loaded, ...stillOpen]
    }, [mapViews, openIds])

    const activeLayer = mapViews.find((l) => l.id === activeLayerId)
    const dataFilters = activeLayer?.dataFilters ?? EMPTY_FILTERS
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
    const highlightColor = useSelector((state) => state.ui.highlightColor)

    const dispatch = useDispatch()
    const panelRef = useRef(null)
    const isDraggingRef = useRef(false)
    const preDragCollapsedRef = useRef(false)
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [searchInputValue, setSearchInputValue] = useState('')
    const globalSearch = useDebouncedValue(searchInputValue, 200)
    const [headersByLayer, setHeadersByLayer] = useState(null)

    const hasActiveFilters = hasActiveDataTableFilters({
        dataFilters,
        globalSearch: searchInputValue,
        selectionFilter,
        showOnlyFeaturesInView,
    })

    const { maxHeight, collapsedHeight, displayHeight } =
        usePanelHeights(isCollapsed)

    const toggleCollapsed = useCallback(
        () => setIsCollapsed((collapsed) => !collapsed),
        []
    )

    const onControlsDoubleClick = useCallback(
        (e) => {
            if (
                e.target.closest('button, input, label, select') ||
                !e.currentTarget.contains(e.target)
            ) {
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
        headersByLayer?.layerId === activeLayerId
            ? headersByLayer.headers
            : null

    const onClearFilters = useCallback(() => {
        dispatch(clearDataFilters(activeLayerId))
        if (showOnlyFeaturesInView) {
            dispatch(toggleShowOnlyFeaturesInView())
        }
        if (selectionFilter?.length) {
            dispatch(setSelectionFilter([]))
        }
        setSearchInputValue('')
    }, [dispatch, activeLayerId, showOnlyFeaturesInView, selectionFilter])

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
            if (!panelRef.current) {
                return
            }
            const width = Math.round(
                panelRef.current.getBoundingClientRect().width
            )
            setPanelWidth((prev) => (prev === width ? prev : width))
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
                <LayerSelectorControl
                    layers={eligibleLayers}
                    activeLayerId={activeLayerId}
                    onSelectLayer={(id) => {
                        dispatch(setActiveDataTableLayer(id))
                        if (!openIds.includes(id)) {
                            dispatch(toggleDataTable(id))
                        }
                    }}
                />
                <span className={styles.divider} />
                <HighlightColorControl
                    color={highlightColor}
                    onChange={onHighlightColorChange}
                />
                <ColumnPickerControl
                    allHeaders={allHeaders}
                    columnConfig={activeLayer?.dataTableColumnConfig}
                    onChange={(config) =>
                        dispatch(
                            setDataTableColumnConfig(activeLayerId, config)
                        )
                    }
                />
                <span className={styles.divider} />
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
                    keyAnalysisDigitGroupSeparator={
                        keyAnalysisDigitGroupSeparator
                    }
                />
                <span className={styles.divider} />
                <ClearFiltersControl
                    disabled={!hasActiveFilters}
                    onClick={onClearFilters}
                />
                <GlobalSearchControl
                    value={searchInputValue}
                    onChange={setSearchInputValue}
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
                    <DataTable
                        activeLayerId={activeLayerId}
                        availableWidth={panelWidth}
                        onCountChange={onCountChange}
                        onHeadersChange={onHeadersChange}
                        globalSearch={globalSearch}
                        onClearFilters={onClearFilters}
                    />
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default BottomPanel
