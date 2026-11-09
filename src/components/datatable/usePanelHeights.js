import { useSelector } from 'react-redux'
import { getPanelHeights } from '../../util/dataTable.js'
import { getCssVar } from '../../util/helpers.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.jsx'

export const usePanelHeights = (isCollapsed) => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const { height } = useWindowDimensions()

    return getPanelHeights({
        windowHeight: height,
        dataTableHeight,
        isCollapsed,
        headerHeight: getCssVar('--header-height'),
        toolbarHeight: getCssVar('--toolbar-height'),
        controlsHeight: getCssVar('--data-table-controls-height'),
    })
}
