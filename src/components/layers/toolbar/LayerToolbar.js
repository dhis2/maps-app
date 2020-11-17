import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Tooltip } from '@dhis2/ui';
import CreateIcon from '@material-ui/icons/Create';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '../../core/IconButton';
import OpacitySlider from './OpacitySlider';
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu';
import styles from './styles/LayerToolbar.module.css';

export const LayerToolbar = ({
    opacity = 1,
    isVisible,
    onOpacityChange,
    toggleLayerVisibility,
    ...expansionMenuProps
}) => {
    const onEdit = expansionMenuProps.onEdit;

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
                        <CreateIcon data-icon="CreateIcon" />
                    </IconButton>
                    <span className={styles.spacer} />
                </Fragment>
            )}

            <IconButton
                tooltip={i18n.t('Toggle visibility')}
                onClick={toggleLayerVisibility}
                className={styles.button}
                dataTest="visibilitybutton"
            >
                {isVisible ? (
                    <VisibilityIcon data-icon="VisibilityIcon" />
                ) : (
                    <VisibilityOffIcon data-icon="VisibilityOffIcon" />
                )}
            </IconButton>

            <div className={styles.sliderContainer}>
                <Tooltip content={i18n.t('Set layer opacity')}>
                    <OpacitySlider
                        opacity={opacity}
                        onChange={onOpacityChange}
                    />
                </Tooltip>
            </div>
            <LayerToolbarMoreMenu {...expansionMenuProps} />
        </div>
    );
};

LayerToolbar.propTypes = {
    opacity: PropTypes.number.isRequired,
    isVisible: PropTypes.bool,
    toggleLayerVisibility: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
};

export default LayerToolbar;
