import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import {
    Menu,
    MenuItem,
    Tooltip,
    IconButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import EditIcon from '@material-ui/icons/Create';
import TableIcon from '@material-ui/icons/ViewList';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/SaveAlt';
import ChartIcon from '@material-ui/icons/BarChart';

const styles = theme => ({
    button: {
        float: 'left',
        padding: 4,
        width: 32,
        height: 32,
    },
    menuItem: {
        padding: '4px 16px',
    },
    divider: {
        margin: `${theme.spacing(1)}px 0`,
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
        openAs: PropTypes.func,
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

    handleOpenAsChartBtnClick = () => {
        this.closeMenu();
        this.props.openAs('CHART');
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
            openAs,
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
                        <MenuItem
                            onClick={this.handleDataTableBtnClick}
                            className={classes.menuItem}
                        >
                            <ListItemIcon>
                                <TableIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Data table')} />
                        </MenuItem>
                    )}
                    {openAs && (
                        <MenuItem
                            onClick={this.handleOpenAsChartBtnClick}
                            className={classes.menuItem}
                        >
                            <ListItemIcon>
                                <ChartIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Open as chart')} />
                        </MenuItem>
                    )}
                    {downloadData && (
                        <MenuItem
                            onClick={this.handleDownloadBtnClick}
                            className={classes.menuItem}
                        >
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
                        <MenuItem
                            onClick={this.handleEditBtnClick}
                            className={classes.menuItem}
                        >
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText primary={i18n.t('Edit layer')} />
                        </MenuItem>
                    )}
                    {onRemove && (
                        <MenuItem
                            onClick={this.handleRemoveBtnClick}
                            className={classes.menuItem}
                        >
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
