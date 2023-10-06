import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    MenuDivider,
    IconMore24,
    IconTable16,
    IconVisualizationColumn16,
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
    layer = {},
    onEdit,
    onRemove,
    toggleDataTable,
    openAs,
    downloadData,
    dataTableOpen,
    hasOrgUnitData,
    isLoading,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const anchorRef = useRef()

    const somethingAboveDivider = toggleDataTable || downloadData,
        somethingBelowDivider = onRemove || onEdit,
        showDivider = somethingAboveDivider && somethingBelowDivider

    if (!somethingAboveDivider && !somethingBelowDivider) {
        return null
    }

    return (
        <>
            <div
                ref={anchorRef}
                className={styles.moreMenuButton}
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                aria-label={i18n.t('Toggle layer menu')}
                data-test="moremenubutton"
            >
                <IconButton
                    tooltip={i18n.t('More actions')}
                    onClick={() => setIsOpen(!isOpen)}
                    dataTest="moremenubutton"
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
                                    disabled={!hasOrgUnitData}
                                />
                            )}
                            {openAs && (
                                <MenuItem
                                    label={i18n.t('Open as chart')}
                                    icon={<IconVisualizationColumn16 />}
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
                                    disabled={!hasOrgUnitData || isLoading}
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
    hasOrgUnitData: PropTypes.bool,
    isLoading: PropTypes.bool,
    layer: PropTypes.object,
    openAs: PropTypes.func,
    toggleDataTable: PropTypes.func,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
}

export default connect(
    ({ dataTable: dataTableOpen, aggregations }, { layer = {} }) => {
        const layerType = layer.layerType || layer.layer
        const isEarthEngine = layerType === EARTH_ENGINE_LAYER
        const hasOrgUnitData =
            layer.data && (!isEarthEngine || layer.aggregationType?.length > 0)
        const isLoading =
            isEarthEngine && hasOrgUnitData && !aggregations[layer.id]

        return { dataTableOpen, hasOrgUnitData, isLoading }
    }
)(LayerToolbarMoreMenu)
