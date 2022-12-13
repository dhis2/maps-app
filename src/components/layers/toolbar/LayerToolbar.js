import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconEdit24, IconView24, IconViewOff24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { IconButton } from '../../core/index.js'
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu.js'
import OpacitySlider from './OpacitySlider.js'
import styles from './styles/LayerToolbar.module.css'

export const LayerToolbar = ({
    hasOpacity,
    opacity = 1,
    isVisible,
    onOpacityChange,
    toggleLayerVisibility,
    ...expansionMenuProps
}) => {
    const onEdit = expansionMenuProps.onEdit

    return (
        <div className={styles.toolbar} data-test="layertoolbar">
            {onEdit && (
                <Fragment>
                    <IconButton
                        tooltip={i18n.t('Edit')}
                        onClick={onEdit}
                        className={styles.button}
                        dataTest="editbutton"
                    >
                        <IconEdit24 />
                    </IconButton>
                    <span className={styles.spacer} />
                </Fragment>
            )}

            <IconButton
                tooltip={i18n.t('Toggle visibility')}
                onClick={toggleLayerVisibility}
                className={cx(styles.button, {
                    visible: isVisible,
                    notvisible: !isVisible,
                })}
                dataTest="visibilitybutton"
            >
                {isVisible ? <IconView24 /> : <IconViewOff24 />}
            </IconButton>

            <div className={styles.sliderContainer}>
                <Tooltip content={i18n.t('Set layer opacity')}>
                    <OpacitySlider
                        opacity={opacity}
                        disabled={!isVisible || !hasOpacity}
                        onChange={onOpacityChange}
                    />
                </Tooltip>
            </div>
            <LayerToolbarMoreMenu {...expansionMenuProps} />
        </div>
    )
}

LayerToolbar.propTypes = {
    toggleLayerVisibility: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    hasOpacity: PropTypes.bool,
    isVisible: PropTypes.bool,
    opacity: PropTypes.number,
    onEdit: PropTypes.func,
}

LayerToolbar.defaultProps = {
    hasOpacity: true,
}

export default LayerToolbar
