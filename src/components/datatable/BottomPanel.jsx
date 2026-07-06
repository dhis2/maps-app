import i18n from '@dhis2/d2-i18n'
import { IconCross16, IconFilter16, Tooltip } from '@dhis2/ui'
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
import { closeDataTable, resizeDataTable } from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ResizeHandle from './ResizeHandle.jsx'
import styles from './styles/BottomPanel.module.css'

const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const activeLayerId = useSelector((state) => state.dataTable)
    const activeLayer = useSelector((state) =>
        state.map.mapViews.find((l) => l.id === activeLayerId)
    )
    const dataFilters = activeLayer?.dataFilters ?? {}
    const hasActiveFilters = Object.keys(dataFilters).length > 0

    const dispatch = useDispatch()
    const { height } = useWindowDimensions()
    const panelRef = useRef(null)
    const nameRef = useRef(null)
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)
    const [nameTooltipPos, setNameTooltipPos] = useState(null)

    const maxHeight =
        height - getCssVar('--header-height') - getCssVar('--toolbar-height')
    const tableHeight =
        dataTableHeight < maxHeight ? dataTableHeight : maxHeight

    const onResize = useCallback((h) => {
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${h}px`
        )
    }, [])

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
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${tableHeight}px`
        )
    }, [tableHeight])

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
            <div className={styles.dataTableControls}>
                <ResizeHandle
                    maxHeight={maxHeight}
                    onResize={onResize}
                    onResizeEnd={(height) => dispatch(resizeDataTable(height))}
                />
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
                {rowCountLabel && (
                    <span className={styles.rowCount}>{rowCountLabel}</span>
                )}
                {hasActiveFilters && (
                    <button
                        className={styles.clearFiltersButton}
                        onClick={() =>
                            dispatch(clearDataFilters(activeLayerId))
                        }
                    >
                        <Tooltip content={i18n.t('Clear filters')}>
                            <span className={styles.filteredIcon}>
                                <IconFilter16 />
                                <span className={styles.clearBadge} />
                            </span>
                        </Tooltip>
                    </button>
                )}
                <button
                    className={styles.closeIcon}
                    onClick={() => dispatch(closeDataTable())}
                >
                    <Tooltip content={i18n.t('Close')}>
                        <IconCross16 />
                    </Tooltip>
                </button>
            </div>
            <div className={styles.tableContainer}>
                <ErrorBoundary>
                    <DataTable
                        availableWidth={panelWidth}
                        onCountChange={onCountChange}
                    />
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default BottomPanel
