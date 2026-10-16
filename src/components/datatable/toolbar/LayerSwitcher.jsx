import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React from 'react'
import { useDispatch } from 'react-redux'
import { openDataTable } from '../../../actions/dataTable.js'
import { useDataTableLayers } from '../useDataTableLayers.js'
import styles from './styles/DataTableToolbar.module.css'

const LayerSwitcher = () => {
    const dispatch = useDispatch()
    const { layers, activeLayer } = useDataTableLayers()

    if (!activeLayer) {
        return null
    }

    // Nothing to switch to, so just name the layer
    if (layers.length < 2) {
        return (
            <span
                className={styles.layerName}
                data-test="data-table-layer-switcher"
            >
                {activeLayer.name}
            </span>
        )
    }

    return (
        <div className={styles.layerSwitcher}>
            <SingleSelect
                dense
                selected={activeLayer.id}
                onChange={({ selected }) => dispatch(openDataTable(selected))}
                menuMaxWidth="480px"
                dataTest="data-table-layer-switcher"
            >
                {layers.map(({ id, name }) => (
                    <SingleSelectOption key={id} value={id} label={name} />
                ))}
            </SingleSelect>
        </div>
    )
}

export default LayerSwitcher
