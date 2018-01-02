import { Component } from 'react';
import { connect } from 'react-redux';
import { getFavorite, closeFavoritesDialog } from '../../actions/favorites';

import D2FavoritesDialog from 'd2-ui/lib/favorites/FavoritesDialog';

class FavoritesDialog extends Component {

    render() {
        const { favoritesDialogOpen, closeFavoritesDialog } = this.props;

        return (
            <D2FavoritesDialog
                type='map'
                open={favoritesDialogOpen}
                onRequestClose={closeFavoritesDialog}
                onFavoriteSelect={console.log}
            />
        );
    }

}

const mapStateToProps = (state) => ({
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
