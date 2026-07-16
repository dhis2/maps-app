import i18n from '@dhis2/d2-i18n'
import {
    IconCross16,
    IconFilter16,
    IconEmptyFrame16,
    IconChevronDown16,
    IconChevronUp16,
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
    setSelectionFilter,
    setHighlightColor,
} from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import ColorPicker from '../core/ColorPicker.jsx'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ResizeHandle from './ResizeHandle.jsx'
import styles from './styles/BottomPanel.module.css'

// Must match `.dataTableControls`'s height in BottomPanel.module.css
const COLLAPSED_HEIGHT = 36
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
    const nameRef = useRef(null)
    const isDraggingRef = useRef(false)
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [nameTooltipPos, setNameTooltipPos] = useState(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [globalSearch, setGlobalSearch] = useState('')

    const hasActiveFilters =
        Object.keys(dataFilters).length > 0 ||
        globalSearch.trim() !== '' ||
        selectionFilter?.length > 0 ||
        showOnlyFeaturesInView

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

    const onClearFilters = useCallback(() => {
        dispatch(clearDataFilters(activeLayerId))
        dispatch(setSelectionFilter([]))
        setGlobalSearch('')
        if (showOnlyFeaturesInView) {
            dispatch(toggleShowOnlyFeaturesInView())
        }
    }, [dispatch, activeLayerId, showOnlyFeaturesInView])

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
                        placement="top"
                    >
                        {isCollapsed ? (
                            <IconChevronUp16 />
                        ) : (
                            <IconChevronDown16 />
                        )}
                    </Tooltip>
                </button>
                <span className={styles.divider} />
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
                <span className={styles.divider} />
                <Tooltip content={i18n.t('Highlight color')} placement="top">
                    <span className={styles.alignIcon2}>
                        <ColorPicker
                            className={styles.highlightColorPicker}
                            color={highlightColor}
                            width={22}
                            height={22}
                            centerIcon
                            onChange={(color) =>
                                dispatch(setHighlightColor(color))
                            }
                        />
                    </span>
                </Tooltip>
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
                <span className={styles.divider} />
                <button
                    className={styles.clearFiltersButton}
                    disabled={!hasActiveFilters}
                    onClick={onClearFilters}
                >
                    <Tooltip content={i18n.t('Clear filters')} placement="top">
                        <span className={styles.filteredIcon}>
                            <IconFilter16 />
                            <span className={styles.clearBadge} />
                        </span>
                    </Tooltip>
                </button>
                <div
                    className={styles.globalSearch}
                    onDoubleClick={(e) => e.stopPropagation()}
                >
                    <Input
                        dense
                        dataTest="data-table-global-search"
                        placeholder={i18n.t('Search all columns')}
                        value={globalSearch}
                        onChange={({ value }) => setGlobalSearch(value)}
                    />
                </div>
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
                        placement="top"
                    >
                        <span className={styles.alignIcon1}>
                            <IconEmptyFrame16 />
                        </span>
                    </Tooltip>
                </button>
                <span className={styles.divider} />
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
