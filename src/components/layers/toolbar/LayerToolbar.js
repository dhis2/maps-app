import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import { Toolbar, IconButton, Tooltip } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import OpacitySlider from './OpacitySlider';
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu';

const styles = theme => ({
    toolbar: {
        position: 'relative',
        height: 32,
        minHeight: 32,
        padding: `0 ${theme.spacing(1)}px`,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    spacer: {
        marginRight: theme.spacing(2),
    },
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
    moreMenuButton: {
        width: 32,
        height: 32,
        padding: 4,
        position: 'absolute',
        right: theme.spacing(0.5),
        top: 0,
    },
    sliderContainer: {
        marginLeft: theme.spacing(0.5),
    },
    sliderRoot: {
        paddingLeft: 0,
        paddingTop: 8,
        paddingBottom: 8,
    },
});

export const LayerToolbar = ({
    opacity,
    isVisible,
    onOpacityChange,
    toggleLayerVisibility,
    classes,
    ...expansionMenuProps
}) => {
    const onEdit = expansionMenuProps.onEdit;

    return (
        <Toolbar className={classes.toolbar} data-test="layertoolbar">
            {onEdit && (
                <Fragment>
                    <Tooltip key="edit" title={i18n.t('Edit')}>
                        <IconButton className={classes.button} onClick={onEdit}>
                            <CreateIcon data-icon="CreateIcon" />
                        </IconButton>
                    </Tooltip>
                    <span className={classes.spacer} />
                </Fragment>
            )}
            <Tooltip title={i18n.t('Toggle visibility')}>
                <IconButton
                    className={classes.button}
                    onClick={toggleLayerVisibility}
                >
                    {isVisible ? (
                        <VisibilityIcon data-icon="VisibilityIcon" />
                    ) : (
                        <VisibilityOffIcon data-icon="VisibilityOffIcon" />
                    )}
                </IconButton>
            </Tooltip>
            <div className={classes.sliderContainer}>
                <Tooltip title={i18n.t('Set layer opacity')}>
                    <div>
                        <OpacitySlider
                            classes={{
                                root: classes.sliderRoot,
                            }}
                            opacity={opacity}
                            onChange={onOpacityChange}
                        />
                    </div>
                </Tooltip>
            </div>
            <LayerToolbarMoreMenu
                classes={{ button: classes.moreMenuButton }}
                {...expansionMenuProps}
            />
        </Toolbar>
    );
};

LayerToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    opacity: PropTypes.number.isRequired,
    isVisible: PropTypes.bool,
    toggleLayerVisibility: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
};

LayerToolbar.defaultProps = {
    opacity: 1,
};

export default withStyles(styles)(LayerToolbar);
