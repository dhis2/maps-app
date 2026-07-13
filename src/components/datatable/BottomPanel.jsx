import i18n from '@dhis2/d2-i18n'
import {
    IconCross16,
    IconFilter16,
    IconEmptyFrame16,
    IconCheckmarkCircle16,
    Input,
    Tooltip,
} from '@dhis2/ui'
import cx from 'classnames'
import React, {
    useRef,
    useCallback,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearDataFilters } from '../../actions/dataFilters.js'
import {
    closeDataTable,
    resizeDataTable,
    toggleShowOnlyFeaturesInView,
    toggleShowOnlySelected,
    setShowOnlySelected,
    setHighlightColor,
} from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import ColorPicker from '../core/ColorPicker.jsx'
import {
    IconChevronDoubleDown16,
    IconChevronDoubleUp16,
} from '../core/icons.jsx'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ResizeHandle from './ResizeHandle.jsx'
import styles from './styles/BottomPanel.module.css'

// Must match `.dataTableControls`'s height in BottomPanel.module.css
const COLLAPSED_HEIGHT = 36
const MIN_HEIGHT = 50

const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const activeLayerId = useSelector((state) => state.dataTable)
    const activeLayer = useSelector((state) =>
        state.map.mapViews.find((l) => l.id === activeLayerId)
    )
    const dataFilters = activeLayer?.dataFilters ?? {}
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const showOnlySelected = useSelector((state) => state.ui.showOnlySelected)
    const selection = useSelector((state) => state.selection)
    const selectedCount =
        selection.layerId === activeLayerId ? selection.ids.length : 0
    const highlightColor = useSelector((state) => state.ui.highlightColor)

    const dispatch = useDispatch()
    const { height } = useWindowDimensions()
    const panelRef = useRef(null)
    const nameRef = useRef(null)
    const isDraggingRef = useRef(false)
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [nameTooltipPos, setNameTooltipPos] = useState(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [globalSearch, setGlobalSearch] = useState('')

    const hasActiveFilters =
        Object.keys(dataFilters).length > 0 || globalSearch.trim() !== ''

    const maxHeight =
        height - getCssVar('--header-height') - getCssVar('--toolbar-height')
    const tableHeight =
        dataTableHeight < maxHeight ? dataTableHeight : maxHeight
    const displayHeight = isCollapsed ? COLLAPSED_HEIGHT : tableHeight

    const toggleCollapsed = useCallback(
        () => setIsCollapsed((collapsed) => !collapsed),
        []
    )

    const onResizeStart = useCallback(() => {
        isDraggingRef.current = true
    }, [])

    const onResize = useCallback((h) => {
        setIsCollapsed(h <= MIN_HEIGHT)
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${h <= MIN_HEIGHT ? COLLAPSED_HEIGHT : h}px`
        )
    }, [])

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

    const onNameMouseEnter = useCallback(() => {
        const el = nameRef.current
        if (!el || el.scrollWidth <= el.offsetWidth) {
            return
        }
        const rect = el.getBoundingClientRect()
        const computed = getComputedStyle(el)
        const lineHeight = Number.parseFloat(computed.lineHeight)
        setNameTooltipPos({
            top: rect.top + (rect.height - lineHeight) / 2,
            left: rect.left,
            color: computed.color,
            fontSize: computed.fontSize,
            lineHeight: `${lineHeight}px`,
            paddingLeft: computed.paddingLeft,
        })
    }, [])

    const onNameMouseLeave = useCallback(() => setNameTooltipPos(null), [])

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

    useKeyDown('Escape', () => dispatch(closeDataTable()), true)

    useEffect(() => {
        if (showOnlySelected && selectedCount === 0) {
            dispatch(setShowOnlySelected(false))
        }
    }, [dispatch, showOnlySelected, selectedCount])

    let rowCountLabel = null
    if (totalCount !== null && filteredCount !== null) {
        rowCountLabel =
            filteredCount < totalCount
                ? i18n.t('{{filtered}} of {{total}} rows', {
                      filtered: filteredCount,
                      total: totalCount,
                  })
                : i18n.t('{{total}} rows', { total: totalCount })
    }

    return (
        <div
            ref={panelRef}
            className={styles.bottomPanel}
            data-test="bottom-panel"
        >
            <div
                className={styles.dataTableControls}
                onDoubleClick={toggleCollapsed}
            >
                <button
                    className={styles.toggleButton}
                    onClick={toggleCollapsed}
                >
                    <Tooltip
                        content={
                            isCollapsed ? i18n.t('Restore') : i18n.t('Collapse')
                        }
                    >
                        {isCollapsed ? (
                            <IconChevronDoubleUp16 />
                        ) : (
                            <IconChevronDoubleDown16 />
                        )}
                    </Tooltip>
                </button>
                <span
                    ref={nameRef}
                    className={styles.layerName}
                    onMouseEnter={onNameMouseEnter}
                    onMouseLeave={onNameMouseLeave}
                >
                    {activeLayer?.name}
                </span>
                {nameTooltipPos &&
                    createPortal(
                        <div
                            className={styles.nameTooltip}
                            style={{
                                top: nameTooltipPos.top,
                                left: nameTooltipPos.left,
                                color: nameTooltipPos.color,
                                fontSize: nameTooltipPos.fontSize,
                                lineHeight: nameTooltipPos.lineHeight,
                                paddingLeft: nameTooltipPos.paddingLeft,
                            }}
                        >
                            {activeLayer?.name}
                        </div>,
                        document.body
                    )}
                <ResizeHandle
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
                />
                <button
                    className={cx(styles.toggleButton, {
                        [styles.active]: showOnlyFeaturesInView,
                    })}
                    onClick={() => dispatch(toggleShowOnlyFeaturesInView())}
                >
                    <Tooltip
                        content={i18n.t(
                            'Show only features in current map view'
                        )}
                    >
                        <IconEmptyFrame16 />
                    </Tooltip>
                </button>
                <button
                    className={cx(styles.toggleButton, {
                        [styles.active]: showOnlySelected,
                    })}
                    onClick={() => dispatch(toggleShowOnlySelected())}
                >
                    <Tooltip content={i18n.t('Show only selected features')}>
                        <IconCheckmarkCircle16 />
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
                    <Tooltip content={i18n.t('Close')}>
                        <IconCross16 />
                    </Tooltip>
                </button>
            </div>
            {!isCollapsed && (
                <div className={styles.tableContainer}>
                    <ErrorBoundary>
                        <DataTable
                            availableWidth={panelWidth}
                            onCountChange={onCountChange}
                            showOnlySelected={showOnlySelected}
                            globalSearch={globalSearch}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    )
}

export default BottomPanel
