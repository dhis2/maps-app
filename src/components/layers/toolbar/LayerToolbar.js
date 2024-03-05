import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconEdit24, IconView24, IconViewOff24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { IconButton } from '../../core/index.js'
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu.js'
import OpacitySlider from './OpacitySlider.js'
import styles from './styles/LayerToolbar.module.css'

const LayerToolbar = ({
    hasOpacity,
    opacity = 1,
    isVisible,
    onOpacityChange,
    toggleLayerVisibility,
    hasError,
    ...expansionMenuProps
}) => {
    const onEdit = expansionMenuProps.onEdit

    return (
        <div className={styles.toolbar} data-test="layertoolbar">
            {onEdit && (
                <IconButton
                    tooltip={i18n.t('Edit')}
                    onClick={onEdit}
                    className={styles.editButton}
                    dataTest="editbutton"
                    disabled={hasError}
                >
                    <IconEdit24 />
                </IconButton>
            )}

            <IconButton
                tooltip={i18n.t('Toggle visibility')}
                onClick={toggleLayerVisibility}
                dataTest="visibilitybutton"
                disabled={hasError}
            >
                {isVisible ? <IconView24 /> : <IconViewOff24 />}
            </IconButton>

            <div className={styles.sliderContainer}>
                <Tooltip content={i18n.t('Set layer opacity')}>
                    <OpacitySlider
                        opacity={opacity}
                        disabled={hasError || !isVisible || !hasOpacity}
                        onChange={onOpacityChange}
                    />
                </Tooltip>
            </div>
            <div className={styles.menuButton}>
                <LayerToolbarMoreMenu
                    hasError={hasError}
                    {...expansionMenuProps}
                />
            </div>
        </div>
    )
}

LayerToolbar.propTypes = {
    toggleLayerVisibility: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    hasOpacity: PropTypes.bool,
    isVisible: PropTypes.bool,
    opacity: PropTypes.number,
    onEdit: PropTypes.func,
}

LayerToolbar.defaultProps = {
    hasOpacity: true,
}

export default LayerToolbar
