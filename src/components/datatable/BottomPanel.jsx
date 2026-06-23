import i18n from '@dhis2/d2-i18n'
import { IconCross16, Button } from '@dhis2/ui'
import React, {
    useRef,
    useCallback,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react'
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
    const [panelWidth, setPanelWidth] = useState(0)
    const [totalCount, setTotalCount] = useState(null)
    const [filteredCount, setFilteredCount] = useState(null)

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

    const rowCountLabel =
        totalCount !== null && filteredCount !== null
            ? filteredCount < totalCount
                ? i18n.t('{{filtered}} of {{total}} rows', {
                      filtered: filteredCount,
                      total: totalCount,
                  })
                : i18n.t('{{total}} rows', { total: totalCount })
            : null

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
                <span className={styles.layerName} title={activeLayer?.name}>
                    {activeLayer?.name}
                </span>
                {rowCountLabel && (
                    <span className={styles.rowCount}>{rowCountLabel}</span>
                )}
                {hasActiveFilters && (
                    <Button
                        small
                        onClick={() =>
                            dispatch(clearDataFilters(activeLayerId))
                        }
                    >
                        {i18n.t('Clear filters')}
                    </Button>
                )}
                <button
                    className={styles.closeIcon}
                    onClick={() => dispatch(closeDataTable())}
                    title={i18n.t('Close')}
                >
                    <IconCross16 />
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
