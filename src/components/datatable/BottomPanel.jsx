import React, {
    useRef,
    useCallback,
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
} from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import ActiveLayerControl from './controls/ActiveLayerControl.jsx'
import ClearFiltersControl from './controls/ClearFiltersControl.jsx'
import CloseControl from './controls/CloseControl.jsx'
import CollapseControl from './controls/CollapseControl.jsx'
import ColumnPickerControl from './controls/ColumnPickerControl.jsx'
import GlobalSearchControl from './controls/GlobalSearchControl.jsx'
import HighlightColorControl from './controls/HighlightColorControl.jsx'
import ResizeHandleControl from './controls/ResizeHandleControl.jsx'
import RowCountControl from './controls/RowCountControl.jsx'
import ShowInViewControl from './controls/ShowInViewControl.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import styles from './styles/BottomPanel.module.css'

const MIN_HEIGHT = 50
const EMPTY_FILTERS = {}

const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const activeLayerId = useSelector((state) => state.dataTable)
    const activeLayer = useSelector((state) =>
        state.map.mapViews.find((l) => l.id === activeLayerId)
    )
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
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [globalSearch, setGlobalSearch] = useState('')
    const [headersByLayer, setHeadersByLayer] = useState(null)

    const hasActiveFilters =
        Object.keys(dataFilters).length > 0 ||
        globalSearch.trim() !== '' ||
        selectionFilter?.length > 0 ||
        showOnlyFeaturesInView

    const maxHeight =
        height - getCssVar('--header-height') - getCssVar('--toolbar-height')
    const tableHeight =
        dataTableHeight < maxHeight ? dataTableHeight : maxHeight
    const collapsedHeight = getCssVar('--data-table-controls-height')
    const displayHeight = isCollapsed ? collapsedHeight : tableHeight

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
    }, [])

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
        dispatch(setSelectionFilter([]))
        setGlobalSearch('')
        if (showOnlyFeaturesInView) {
            dispatch(toggleShowOnlyFeaturesInView())
        }
    }, [dispatch, activeLayerId, showOnlyFeaturesInView])

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
                <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={toggleCollapsed}
                />
                <span className={styles.divider} />
                <ActiveLayerControl name={activeLayer?.name} />
                <span className={styles.divider} />
                <HighlightColorControl
                    color={highlightColor}
                    onChange={onHighlightColorChange}
                />
                <ColumnPickerControl
                    layerId={activeLayerId}
                    allHeaders={allHeaders}
                    columnConfig={activeLayer?.dataTableColumnConfig}
                />
                <span className={styles.divider} />
                <ResizeHandleControl
                    maxHeight={maxHeight}
                    minHeight={MIN_HEIGHT}
                    onResizeStart={onResizeStart}
                    onResize={onResize}
                    onResizeEnd={onResizeEnd}
                />
                {rowCountLabel && (
                    <span className={styles.rowCount}>{rowCountLabel}</span>
                )}
                {hasActiveFilters && (
                    <button
                        type="button"
                        className={styles.clearFiltersButton}
                        onClick={() => {
                            dispatch(clearDataFilters(activeLayerId))
                            setGlobalSearch('')
                        }}
                    >
                        <Tooltip content={i18n.t('Clear filters')}>
                            <span className={styles.filteredIcon}>
                                <IconFilter16 />
                                <span className={styles.clearBadge} />
                            </span>
                        </Tooltip>
                    </button>
                )}
                <Input
                    dense
                    dataTest="data-table-global-search"
                    placeholder={i18n.t('Search all columns')}
                    value={globalSearch}
                    onChange={({ value }) => setGlobalSearch(value)}
                    className={styles.globalSearch}
                    onDoubleClick={(e) => e.stopPropagation()}
                />
                <button
                    type="button"
                    className={cx(styles.toggleButton, {
                        [styles.active]: showOnlyFeaturesInView,
                    })}
                    onClick={() => dispatch(toggleShowOnlyFeaturesInView())}
                >
                    <Tooltip
                        content={i18n.t(
                            'Show only features in current map view'
                        )}
                        placement="top"
                    >
                        <span className={styles.alignIcon1}>
                            <IconEmptyFrame16 />
                        </span>
                    </Tooltip>
                </button>
                <Tooltip content={i18n.t('Highlight color')}>
                    <ColorPicker
                        className={styles.highlightColorPicker}
                        color={highlightColor}
                        width={18}
                        height={18}
                        centerIcon
                        onChange={(color) => dispatch(setHighlightColor(color))}
                    />
                </Tooltip>
                <button
                    className={styles.closeIcon}
                    onClick={() => dispatch(closeDataTable())}
                >
                    <Tooltip content={i18n.t('Close')} placement="top">
                        <span className={styles.alignIcon1}>
                            <IconCross16 />
                        </span>
                    </Tooltip>
                </button>
            </div>
            {!isCollapsed && (
                <div className={styles.tableContainer}>
                    <ErrorBoundary>
                        <DataTable
                            availableWidth={panelWidth}
                            onCountChange={onCountChange}
                            onHeadersChange={onHeadersChange}
                            globalSearch={globalSearch}
                            onClearFilters={onClearFilters}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    )
}

export default BottomPanel
