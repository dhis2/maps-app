import i18n from '@dhis2/d2-i18n'
import {
    FlyoutMenu,
    IconChevronDown16,
    IconChevronUp16,
    Layer,
    MenuItem,
    MenuSectionHeader,
    Popper,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { openDataTable } from '../../../actions/dataTable.js'
import { useDataTableLayers } from '../useDataTableLayers.js'
import styles from './styles/DataTableToolbar.module.css'

const LayerSwitcher = () => {
    const dispatch = useDispatch()
    const anchorRef = useRef()
    const [isOpen, setIsOpen] = useState(false)
    const { layers, activeLayer } = useDataTableLayers()

    if (!activeLayer) {
        return null
    }

    const canSwitch = layers.length > 1

    return (
        <>
            <button
                ref={anchorRef}
                className={styles.layerSwitcher}
                onClick={() => canSwitch && setIsOpen(!isOpen)}
                disabled={!canSwitch}
                title={
                    canSwitch
                        ? i18n.t('Switch layer shown in data table')
                        : undefined
                }
                data-test="data-table-layer-switcher"
            >
                <span className={styles.layerName}>{activeLayer.name}</span>
                {canSwitch &&
                    (isOpen ? <IconChevronUp16 /> : <IconChevronDown16 />)}
            </button>
            {isOpen && (
                <Layer onBackdropClick={() => setIsOpen(false)}>
                    <Popper reference={anchorRef} placement="top-start">
                        <FlyoutMenu dense>
                            <MenuSectionHeader
                                label={i18n.t('Show in data table')}
                                dense
                                hideDivider
                            />
                            {layers.map(({ id, name }) => (
                                <MenuItem
                                    key={id}
                                    label={name}
                                    active={id === activeLayer.id}
                                    checked={id === activeLayer.id}
                                    dense
                                    onClick={() => {
                                        dispatch(openDataTable(id))
                                        setIsOpen(false)
                                    }}
                                />
                            ))}
                        </FlyoutMenu>
                    </Popper>
                </Layer>
            )}
        </>
    )
}

export default LayerSwitcher
