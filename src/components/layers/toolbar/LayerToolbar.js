import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import OpacitySlider from './OpacitySlider';
import LayerToolbarMoreMenu from './LayerToolbarMoreMenu';

const styles = {
    toolbar: {
        position: 'relative',
        backgroundColor: '#eee',
        height: 32,
        minHeight: 32,
        padding: '0 8px',
    },
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
    // moreButton: {
    //     float: 'right',
    //     padding: 4,
    //     width: 32,
    //     height: 32,
    //     marginRight: -7,
    //     marginLeft: -5,
    // },
    alignRight: {
        position: 'absolute',
        right: 8,
    },
};

const LayerCardToolbar = ({
    opacity,
    isVisible,
    layerType,
    onEdit,
    onRemove,
    toggleDataTable,
    toggleLayerVisibility,
    onOpacityChange,
    classes,
}) => (
    <Toolbar className={classes.toolbar}>
        <OpacitySlider opacity={opacity} onChange={onOpacityChange} />
        <Tooltip key="visibility" title={i18n.t('Toggle visibility')}>
            <IconButton
                className={classes.button}
                onClick={toggleLayerVisibility}
            >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
        {layerType !== 'basemap' && (
            <div className={classes.alignRight}>
                <LayerToolbarMoreMenu
                    classes={{ button: classes.button }}
                    layerType={layerType}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    toggleDataTable={toggleDataTable}
                />
            </div>
        )}
    </Toolbar>
);

LayerCardToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    layerType: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
    isVisible: PropTypes.bool.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
};

export default withStyles(styles)(LayerCardToolbar);
