import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Tooltip } from '@dhis2/ui';
import CreateIcon from '@material-ui/icons/Create';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
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
                    <Tooltip content={i18n.t('Edit')}>
                        <div
                            className={styles.button}
                            onClick={onEdit}
                            data-test="editbutton"
                        >
                            <CreateIcon data-icon="CreateIcon" />
                        </div>
                    </Tooltip>
                    <span className={styles.spacer} />
                </Fragment>
            )}
            <Tooltip content={i18n.t('Toggle visibility')}>
                <div
                    className={styles.button}
                    onClick={toggleLayerVisibility}
                    data-test="visibilitybutton"
                >
                    {isVisible ? (
                        <VisibilityIcon data-icon="VisibilityIcon" />
                    ) : (
                        <VisibilityOffIcon data-icon="VisibilityOffIcon" />
                    )}
                </div>
            </Tooltip>
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
