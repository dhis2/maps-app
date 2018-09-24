import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';
import ViewListIcon from '@material-ui/icons/ViewList';
import DeleteIcon from '@material-ui/icons/Delete';

// import DownloadMenu from './DownloadMenu';
// import OpenAsMenu from './OpenAsMenu';

const styles = {
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
};

const dataTableLayerTypes = ['facility', 'thematic', 'boundary'];

class LayerMoreMenu extends Component {
    state = {
        open: false,
        anchorEl: null,
    };

    static propTypes = {
        classes: PropTypes.object.isRequired,
        layerType: PropTypes.string.isRequired,
        onEdit: PropTypes.func,
        onRemove: PropTypes.func,
        toggleDataTable: PropTypes.func,
    };

    handleBtnClick = e => {
        this.setState({
            anchorEl: e.currentTarget,
            open: true,
        });
    };

    closeMenu = () => {
        this.setState({
            anchorEl: null,
            open: false,
        });
    };

    handleEditBtnClick = () => {
        this.closeMenu();
        this.props.onEdit();
    };

    handleDataTableBtnClick = () => {
        this.closeMenu();
        this.props.toggleDataTable();
    };

    handleRemoveBtnClick = () => {
        this.closeMenu();
        this.props.onRemove();
    };

    render() {
        const {
            classes,
            layerType,
            onEdit,
            onRemove,
            toggleDataTable,
        } = this.props;
        const canToggleDataTable =
            toggleDataTable && dataTableLayerTypes.indexOf(layerType) !== -1;

        const somethingAboveDivider = canToggleDataTable,
            somethingBelowDivider = onRemove || onEdit,
            showDivider = somethingAboveDivider && somethingBelowDivider;

        return (
            <Fragment>
                <Tooltip title={i18n.t('More')}>
                    <IconButton
                        className={classes.button}
                        onClick={this.handleBtnClick}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={this.state.anchorEl}
                    getContentAnchorEl={null}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.open}
                    onClose={this.closeMenu}
                >
                    {canToggleDataTable && (
                        <MenuItem onClick={this.handleDataTableBtnClick}>
                            <ListItemIcon>
                                <ViewListIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Data table')} />
                        </MenuItem>
                    )}
                    {showDivider && <Divider light />}
                    {onEdit && (
                        <MenuItem onClick={this.handleEditBtnClick}>
                            <ListItemIcon>
                                <CreateIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Edit layer')} />
                        </MenuItem>
                    )}
                    {onRemove && (
                        <MenuItem onClick={this.handleRemoveBtnClick}>
                            <ListItemIcon>
                                <DeleteIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Remove layer')} />
                        </MenuItem>
                    )}
                </Menu>
            </Fragment>
        );
    }
}

export default withStyles(styles)(LayerMoreMenu);
