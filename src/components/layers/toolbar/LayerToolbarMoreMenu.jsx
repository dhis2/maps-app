import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    MenuDivider,
    IconMore24,
    IconTable16,
    IconLaunch16,
    IconDownload16,
    IconEdit16,
    IconDelete16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'
import { IconButton } from '../../core/index.js'
import styles from './styles/LayerToolbarMore.module.css'

const LayerToolbarMoreMenu = ({
    layer,
    onEdit,
    onRemove,
    toggleDataTable,
    openAs,
    downloadData,
    dataTableOpen,
    hasOrgUnitData,
    isLoading,
    hasError,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const anchorRef = useRef()

    const somethingAboveDivider = toggleDataTable || downloadData,
        somethingBelowDivider = onRemove || onEdit,
        showDivider = somethingAboveDivider && somethingBelowDivider

    if (!somethingAboveDivider && !somethingBelowDivider) {
        return null
    }

    const showDataTableDisabled =
        !hasOrgUnitData && (!dataTableOpen || dataTableOpen !== layer.id)

    return (
        <>
            <div ref={anchorRef}>
                <IconButton
                    tooltip={i18n.t('More actions')}
                    onClick={() => setIsOpen(!isOpen)}
                    dataTest="moremenubutton"
                    ariaLabel={i18n.t('Toggle layer menu')}
                >
                    <IconMore24 />
                </IconButton>
            </div>

            {isOpen && layer && (
                <Popover
                    reference={anchorRef}
                    arrow={false}
                    placement="right-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.menu}>
                        <Menu dense dataTest="more-menu">
                            {toggleDataTable && (
                                <MenuItem
                                    label={
                                        dataTableOpen === layer.id
                                            ? i18n.t('Hide data table')
                                            : i18n.t('Show data table')
                                    }
                                    icon={<IconTable16 />}
                                    onClick={() => {
                                        setIsOpen(false)
                                        toggleDataTable()
                                    }}
                                    disabled={hasError || showDataTableDisabled}
                                />
                            )}
                            {openAs && (
                                <MenuItem
                                    label={i18n.t(
                                        'Open in Data Visualizer app'
                                    )}
                                    icon={<IconLaunch16 />}
                                    onClick={() => {
                                        setIsOpen(false)
                                        openAs('CHART')
                                    }}
                                />
                            )}
                            {downloadData && (
                                <MenuItem
                                    label={i18n.t('Download data')}
                                    icon={<IconDownload16 />}
                                    onClick={() => {
                                        setIsOpen(false)
                                        downloadData()
                                    }}
                                    disabled={
                                        hasError || !hasOrgUnitData || isLoading
                                    }
                                />
                            )}
                            {showDivider && <MenuDivider />}
                            {onEdit && (
                                <MenuItem
                                    label={i18n.t('Edit layer')}
                                    icon={<IconEdit16 />}
                                    onClick={() => {
                                        setIsOpen(false)
                                        onEdit()
                                    }}
                                />
                            )}
                            {onRemove && (
                                <MenuItem
                                    label={i18n.t('Remove layer')}
                                    icon={<IconDelete16 />}
                                    destructive
                                    onClick={() => {
                                        setIsOpen(false)
                                        onRemove()
                                    }}
                                />
                            )}
                        </Menu>
                    </div>
                </Popover>
            )}
        </>
    )
}

LayerToolbarMoreMenu.propTypes = {
    dataTableOpen: PropTypes.string,
    downloadData: PropTypes.func,
    hasError: PropTypes.bool,
    hasOrgUnitData: PropTypes.bool,
    isLoading: PropTypes.bool,
    layer: PropTypes.object,
    openAs: PropTypes.func,
    toggleDataTable: PropTypes.func,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
}

const DEFAULT_EMPTY_LAYER = {}

export default connect(
    (
        { dataTable: dataTableOpen, aggregations },
        { layer = DEFAULT_EMPTY_LAYER }
    ) => {
        const isEarthEngine = layer.layer === EARTH_ENGINE_LAYER
        const hasOrgUnitData =
            layer.data && (!isEarthEngine || layer.aggregationType?.length > 0)
        const isLoading =
            isEarthEngine && hasOrgUnitData && !aggregations[layer.id]

        return { dataTableOpen, hasOrgUnitData, isLoading }
    }
)(LayerToolbarMoreMenu)
