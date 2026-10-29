import React, {
    useRef,
    useCallback,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react'
import cx from 'classnames'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataTable, resizeDataTable } from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ResizeHandle from './ResizeHandle.jsx'
import DataTableToolbar from './toolbar/DataTableToolbar.jsx'
import styles from './styles/BottomPanel.module.css'

// Container for DataTable
const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)

    const dispatch = useDispatch()
    const { height } = useWindowDimensions()
    const panelRef = useRef(null)
    const [panelWidth, setPanelWidth] = useState(0)
    const [showColumnsModal, setShowColumnsModal] = useState(false)
    // PROTOTYPE: collapsed state only lasts while the table is open
    const [collapsed, setCollapsed] = useState(false)
    // PROTOTYPE: column config is kept per layer for this session only
    const [columnsByLayer, setColumnsByLayer] = useState({})
    const activeLayerId = useSelector((state) => state.dataTable)

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

    useLayoutEffect(() => {
        if (collapsed) {
            return
        }
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${tableHeight}px`
        )
    }, [tableHeight, collapsed])

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
                const rect = panelRef.current.getBoundingClientRect()
                setPanelWidth(rect.width)
                // Collapsed panel sizes to its content, so the map follows it
                if (panelRef.current.dataset.collapsed === 'true') {
                    document.documentElement.style.setProperty(
                        '--data-table-height',
                        `${rect.height}px`
                    )
                }
            }
        })
        if (panelRef.current) {
            observer.observe(panelRef.current)
        }
        return () => observer.disconnect()
    }, [])

    useKeyDown('Escape', () => dispatch(closeDataTable()), true)

    return (
        <div
            ref={panelRef}
            className={cx(styles.bottomPanel, {
                [styles.collapsed]: collapsed,
            })}
            data-collapsed={collapsed}
            data-test="bottom-panel"
        >
            {!collapsed && (
                <div className={styles.resizeArea}>
                    <ResizeHandle
                        maxHeight={maxHeight}
                        onResize={onResize}
                        onResizeEnd={(height) =>
                            dispatch(resizeDataTable(height))
                        }
                    />
                </div>
            )}
            <DataTableToolbar
                collapsed={collapsed}
                onCollapseToggle={() => setCollapsed(!collapsed)}
                onColumnsClick={() => setShowColumnsModal(true)}
            />
            <div className={styles.tableContainer}>
                <ErrorBoundary>
                    <DataTable
                        availableWidth={panelWidth}
                        collapsed={collapsed}
                        visibleColumns={columnsByLayer[activeLayerId]}
                        showColumnsModal={showColumnsModal}
                        onColumnsModalClose={() => setShowColumnsModal(false)}
                        onColumnsChange={(columns) => {
                            setColumnsByLayer({
                                ...columnsByLayer,
                                [activeLayerId]: columns,
                            })
                            setShowColumnsModal(false)
                        }}
                    />
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default BottomPanel
