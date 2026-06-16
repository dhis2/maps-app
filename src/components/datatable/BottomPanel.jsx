import { IconCross16 } from '@dhis2/ui'
import React, {
    useRef,
    useCallback,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataTable, resizeDataTable } from '../../actions/dataTable.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'
import DataTable from './DataTable.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ResizeHandle from './ResizeHandle.jsx'
import styles from './styles/BottomPanel.module.css'

// Container for DataTable
const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)

    const dispatch = useDispatch()
    const { height } = useWindowDimensions()
    const panelRef = useRef(null)
    const [panelWidth, setPanelWidth] = useState(0)

    const maxHeight =
        height - getCssVar('--header-height') - getCssVar('--toolbar-height')
    const tableHeight =
        dataTableHeight < maxHeight ? dataTableHeight : maxHeight
    const [currentHeight, setCurrentHeight] = useState(tableHeight)
    useEffect(() => setCurrentHeight(tableHeight), [tableHeight])

    const onResize = useCallback((h) => {
        panelRef.current.style.height = `${h}px`
        document.documentElement.style.setProperty(
            '--data-table-height',
            `${h}px`
        )
        setCurrentHeight(h)
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

    return (
        <div
            ref={panelRef}
            className={styles.bottomPanel}
            style={{ height: currentHeight }}
            data-test="bottom-panel"
        >
            <div className={styles.dataTableControls}>
                <ResizeHandle
                    maxHeight={maxHeight}
                    onResize={onResize}
                    onResizeEnd={(height) => dispatch(resizeDataTable(height))}
                />
                <button
                    className={styles.closeIcon}
                    onClick={() => dispatch(closeDataTable())}
                >
                    <IconCross16 />
                </button>
            </div>
            <div className={styles.tableContainer}>
                <ErrorBoundary>
                    <DataTable availableWidth={panelWidth} />
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default BottomPanel
