import { Component } from 'react';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Button from 'material-ui/FlatButton'; // TODO: Support buttons with without uppercase in d2-ui
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FavoritesDialog from './FavoritesDialog';
import SaveFavoriteDialog from './SaveFavoriteDialog';
import { openFavoritesDialog, openSaveFavoriteDialog } from '../../actions/favorites';

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
    }
};

class FavoritesMenu extends Component {
    state = {};

    openMenu(evt) {
        this.setState({ anchorEl: evt.currentTarget })
    }

    closeMenu() {
        this.setState({ anchorEl: null });
    }

    onLoadClick() {
        this.closeMenu();
        this.props.openFavoritesDialog();
    }

    onSaveClick() {
        this.closeMenu();
        this.props.openSaveFavoriteDialog();
    }

    render() {
        const { openFavoritesDialog, openSaveFavoriteDialog } = this.props;
        const { anchorEl } = this.state;

        return [
            <Button
                key='favorites-btn'
                onClick={evt => this.openMenu(evt)}
                style={styles.button}
            >{i18next.t('Favorites')}</Button>,
            <Popover
                key='favorites-menu'
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onRequestClose={evt => this.closeMenu()}
                style={styles.popover}
            >
              <Menu>
                  <MenuItem
                      primaryText={i18next.t('Open')}
                      onClick={() => this.onLoadClick()}
                  />
                  <MenuItem
                      primaryText={i18next.t('New')}
                      onClick={() => this.onSaveClick()}
                  />
              </Menu>
            </Popover>,
            <FavoritesDialog
                key='favorite-load'
            />,
            <SaveFavoriteDialog
                key='favorite-save'
            />
        ]
    }
}

export default connect(
  null,
  { openFavoritesDialog, openSaveFavoriteDialog }
)(FavoritesMenu);
