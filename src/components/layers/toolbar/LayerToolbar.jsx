import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconEdit24, IconView24, IconViewOff24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { IconButton } from '../../core/index.js'
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu.jsx'
import OpacitySlider from './OpacitySlider.jsx'
import styles from './styles/LayerToolbar.module.css'

const LayerToolbar = ({
    hasOpacity = true,
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
                    dataTest="layer-edit-button"
                >
                    <IconEdit24 />
                </IconButton>
            )}
            <IconButton
                tooltip={!hasError ? i18n.t('Toggle visibility') : null}
                onClick={toggleLayerVisibility}
                className={cx({
                    visible: isVisible, // for cypress testing only
                    notvisible: !isVisible, // for cypress testing only
                })}
                dataTest="visibilitybutton"
                disabled={hasError}
            >
                {isVisible ? <IconView24 /> : <IconViewOff24 />}
            </IconButton>

            <div className={styles.sliderContainer}>
                <Tooltip
                    content={
                        hasError
                            ? i18n.t('Layer is invalid')
                            : i18n.t('Set layer opacity')
                    }
                    disabled={hasError}
                >
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

export default LayerToolbar
