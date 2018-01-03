import { Component } from 'react';
import { connect } from 'react-redux';
import { closeFavoritesDialog } from '../../actions/ui';
import { loadMap } from '../../actions/map';

import D2FavoritesDialog from 'd2-ui/lib/favorites/FavoritesDialog';

// TODO: Make functional component
class FavoritesDialog extends Component {

    render() {
        const { favoritesDialogOpen, onFavoriteSelect, closeFavoritesDialog } = this.props;

        return (
            <D2FavoritesDialog
                type='map'
                open={favoritesDialogOpen}
                onRequestClose={closeFavoritesDialog}
                onFavoriteSelect={onFavoriteSelect}
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
        dispatch(loadMap(id));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesDialog);
