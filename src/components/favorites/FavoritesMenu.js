import { Component } from 'react';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Button from 'material-ui/FlatButton'; // TODO: Support buttons with without uppercase in d2-ui
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FavoritesDialog from './FavoritesDialog';
import SaveNewFavoriteDialog from './SaveNewFavoriteDialog';
import InterpretationDialog from './InterpretationDialog';
import LinksDialog from './LinksDialog';
import { closeDataTable } from '../../actions/dataTable';
import {
    loadFavorite,
    saveFavorite,
    openFavoritesDialog,
    openSaveNewFavoriteDialog,
} from '../../actions/favorites';

import {
    saveInterpretation,
} from '../../actions/interpretations';

const styles = {
    button: {
        color: '#333',
        height: 40,
        margin: 0,
        padding: '4px 16px 0 16px',
        minWidth: 50,
    },
    popover: {
        marginLeft: 10,
    },
};

class FavoritesMenu extends Component {
    state = {
        showInterpretationDialog: false,
        showLinksDialog: false,
    };

    openMenu(evt) {
        this.setState({ anchorEl: evt.currentTarget });
    }

    closeMenu() {
        this.setState({ anchorEl: null });
    }

    onNewMapClick() {
        this.closeMenu();
        this.props.closeDataTable();
        this.props.loadFavorite(null);
    }

    onLoadClick() {
        this.closeMenu();
        this.props.openFavoritesDialog();
    }

    onSaveClick() {
        this.closeMenu();
        this.props.saveFavorite();
    }

    onSaveNewClick() {
        this.closeMenu();
        this.props.openSaveNewFavoriteDialog();
    }

    onWriteInterpretationClick() {
        this.closeMenu();
        this.setState({ showInterpretationDialog: true });
    }

    onGetLinkClick() {
        this.closeMenu();
        this.setState({ showLinksDialog: true });
    }

    onDialogClose() {
        this.setState({
            showInterpretationDialog: false,
            showLinksDialog: false,
        });
    }

    onDialogSave(newInterpretation) {
        this.props.saveInterpretation(newInterpretation);
        this.onDialogClose();
    }

    render() {
        const { mapId } = this.props;
        const {
            anchorEl,
            showInterpretationDialog,
            showLinksDialog,
        } = this.state;

        return [
            <Button
                key="favorites-btn"
                onClick={evt => this.openMenu(evt)}
                style={styles.button}
            >
                {i18next.t('Favorites')}
            </Button>,
            <Popover
                key="favorites-menu"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onRequestClose={evt => this.closeMenu()}
                style={styles.popover}
            >
                <Menu>
                    <MenuItem
                        primaryText={i18next.t('New')}
                        onClick={() => this.onNewMapClick()}
                    />
                    <MenuItem
                        primaryText={i18next.t('Open')}
                        onClick={() => this.onLoadClick()}
                    />
                    <MenuItem
                        primaryText={i18next.t('Save')}
                        onClick={() => this.onSaveClick()}
                        disabled={mapId === undefined}
                    />
                    <MenuItem
                        primaryText={i18next.t('Save as')}
                        onClick={() => this.onSaveNewClick()}
                    />
                    <MenuItem
                        primaryText={i18next.t('Write interpretation')}
                        onClick={() => this.onWriteInterpretationClick()}
                        disabled={mapId === undefined}
                    />
                    <MenuItem
                        primaryText={i18next.t('Get link')}
                        onClick={() => this.onGetLinkClick()}
                        disabled={mapId === undefined}
                    />
                </Menu>
            </Popover>,
            <FavoritesDialog key="favorite-load" />,
            <SaveNewFavoriteDialog key="favorite-save" />,
            showInterpretationDialog && (
                <InterpretationDialog
                    key="interpretation"
                    favoriteId={mapId}
                    onSave={newInterpretation => this.onDialogSave(newInterpretation)}
                    onClose={() => this.onDialogClose()}
                />
            ),
            showLinksDialog && (
                <LinksDialog
                    key="links"
                    favoriteId={mapId}
                    onClose={() => this.onDialogClose()}
                />
            ),
        ];
    }
}

export default connect(
    state => ({
        mapId: state.map.id,
        favoritesDialogOpen: state.favorite.dialogOpen,
    }),
    {
        loadFavorite,
        saveFavorite,
        openFavoritesDialog,
        openSaveNewFavoriteDialog,
        saveInterpretation,
        closeDataTable,
    }
)(FavoritesMenu);
