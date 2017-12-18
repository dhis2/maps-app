import { Component } from 'react';
import { connect } from 'react-redux'
import FavoriteWindow from '../../app/FavoriteWindow';
import { getFavorite, closeFavoritesDialog } from '../../actions/favorites';

class FavoritesDialog extends Component {

    componentDidUpdate(prevProps) {
        const {
            map,
            favoritesDialogOpen,
            onFavoriteSelect,
            closeFavoritesDialog,
        } = this.props;

        if (favoritesDialogOpen) {
            if (!this.favoriteWindow) { // Only create once
                this.favoriteWindow = FavoriteWindow(gis);
                this.favoriteWindow.onFavoriteClick = onFavoriteSelect;
                this.favoriteWindow.onClose = closeFavoritesDialog;
            }

            this.favoriteWindow.map = map; // Hack to make map definition available within the Ext component
            this.favoriteWindow.show();
        } else if (this.favoriteWindow) {
            this.favoriteWindow.hide();
        }
    }

    // React rendering will happen here later :-)
    render() {
        return null;
    }

}

const mapStateToProps = (state) => ({
    map: {...state.map},
    favoritesDialogOpen: state.ui.favoritesDialogOpen,
});

const mapDispatchToProps = (dispatch) => ({
    closeFavoritesDialog: () => dispatch(closeFavoritesDialog()),
    onFavoriteSelect: (id) => {
        dispatch(closeFavoritesDialog());
        dispatch(getFavorite(id));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesDialog);
