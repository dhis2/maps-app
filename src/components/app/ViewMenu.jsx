import {
    HoverMenuDropdown,
    HoverMenuList,
    HoverMenuListItem,
} from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch } from 'react-redux'
import { closeDataTable, openDataTable } from '../../actions/dataTable.js'
import { useDataTableLayers } from '../datatable/useDataTableLayers.js'

const ViewMenu = () => {
    const dispatch = useDispatch()
    const { layers, activeLayer } = useDataTableLayers()

    const onToggleDataTable = () =>
        activeLayer
            ? dispatch(closeDataTable())
            : dispatch(openDataTable(layers[0].id))

    return (
        <HoverMenuDropdown label={i18n.t('View')} dataTest="view-menu">
            <HoverMenuList dense>
                <HoverMenuListItem
                    label={
                        activeLayer
                            ? i18n.t('Hide data table')
                            : i18n.t('Show data table')
                    }
                    disabled={!layers.length}
                    onClick={onToggleDataTable}
                    dataTest="view-menu-toggle-data-table"
                />
            </HoverMenuList>
        </HoverMenuDropdown>
    )
}

export default ViewMenu
