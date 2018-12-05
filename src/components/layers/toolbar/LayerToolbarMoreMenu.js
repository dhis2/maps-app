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

import MoreIcon from '@material-ui/icons/MoreHoriz';
import CreateIcon from '@material-ui/icons/Create';
import ViewListIcon from '@material-ui/icons/ViewList';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/SaveAlt';

const styles = theme => ({
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
    divider: {
        margin: `${theme.spacing.unit}px 0`,
    },
});

export class LayerToolbarMoreMenu extends Component {
    state = {
        open: false,
        anchorEl: null,
    };

    static propTypes = {
        classes: PropTypes.object.isRequired,
        onEdit: PropTypes.func,
        onRemove: PropTypes.func,
        toggleDataTable: PropTypes.func,
        downloadData: PropTypes.func,
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

    handleDownloadBtnClick = () => {
        this.closeMenu();
        this.props.downloadData();
    };

    render() {
        const {
            classes,
            onEdit,
            onRemove,
            toggleDataTable,
            downloadData,
        } = this.props;

        const somethingAboveDivider = toggleDataTable || downloadData,
            somethingBelowDivider = onRemove || onEdit,
            showDivider = somethingAboveDivider && somethingBelowDivider;

        if (!somethingAboveDivider && !somethingBelowDivider) {
            return null;
        }

        return (
            <Fragment>
                <Tooltip title={i18n.t('More actions')}>
                    <IconButton
                        className={classes.button}
                        onClick={this.handleBtnClick}
                    >
                        <MoreIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={this.state.anchorEl}
                    getContentAnchorEl={null}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.open}
                    onClose={this.closeMenu}
                    disableRestoreFocus={true} // Don't re-focus on the Tooltip after the dialog is closed
                >
                    {toggleDataTable && (
                        <MenuItem onClick={this.handleDataTableBtnClick}>
                            <ListItemIcon>
                                <ViewListIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Data table')} />
                        </MenuItem>
                    )}
                    {downloadData && (
                        <MenuItem onClick={this.handleDownloadBtnClick}>
                            <ListItemIcon>
                                <SaveIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Download data')} />
                        </MenuItem>
                    )}
                    {showDivider && (
                        <Divider className={classes.divider} light />
                    )}
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

export default withStyles(styles)(LayerToolbarMoreMenu);
