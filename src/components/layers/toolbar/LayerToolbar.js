import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import ViewListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';
import OpacitySlider from './OpacitySlider';
// import DownloadMenu from './DownloadMenu';
// import OpenAsMenu from './OpenAsMenu';

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
    moreButton: {
        float: 'right',
        padding: 4,
        width: 32,
        height: 32,
        marginRight: -7,
        marginLeft: -5,
    },
    menuList: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    alignRight: {
        position: 'absolute',
        right: 8,
    },
};

const dataTableLayers = ['facility', 'thematic', 'boundary'];

const OverlayToolbar = ({
    layer,
    onEdit,
    onRemove,
    toggleDataTable,
    toggleLayerVisibility,
    onOpacityChange,
    classes
}) => (
    <Toolbar className={classes.toolbar}>
        {onEdit &&
            layer.type !== 'external' && (
                <Tooltip title={i18n.t('Edit')}>
                    <IconButton onClick={() => onEdit(layer)} className={classes.button}>
                        <CreateIcon />
                    </IconButton>
                </Tooltip>
            )
        }
        {dataTableLayers.includes(layer.layer) && (
            <Tooltip title={i18n.t('Data table')}>
            <IconButton onClick={() => toggleDataTable(layer.id)} className={classes.button}>
                <ViewListIcon />
            </IconButton>
            </Tooltip>
        )}
        <OpacitySlider
            opacity={layer.opacity}
            onChange={opacity => onOpacityChange(layer.id, opacity)}
        />
        <Tooltip
            key="visibility"
            title={i18n.t('Toggle visibility')}
        >
            <IconButton
                className={classes.button}
                onClick={() => toggleLayerVisibility(layer.id)}
                style={{ backgroundColor: 'transparent' }}
            >
                {layer.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
        <div className={classes.alignRight}>
            {onRemove && (
                <Tooltip title={i18n.t('Delete')}>
                    <IconButton onClick={onRemove} className={classes.button}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    </Toolbar>
);

/*
<IconMenu
    iconButtonElement={
        <IconButton
            tooltip={i18n.t('More')}
            tooltipPosition="top-center"
            style={styles.moreButton}
        >
            <SvgIcon icon="MoreVert" />
        </IconButton>
    }
    listStyle={styles.menuList}
>
    <OpenAsMenu {...layer} />
    <DownloadMenu {...layer} />
</IconMenu>
*/

OverlayToolbar.propTypes = {
    layer: PropTypes.object,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    toggleLayerVisibility: PropTypes.func,
    onOpacityChange: PropTypes.func,
    toggleDataTable: PropTypes.func,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OverlayToolbar);
