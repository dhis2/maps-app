import { Component } from 'react';
import { connect } from 'react-redux';
import D2FavoritesDialog from 'd2-ui/lib/favorites/FavoritesDialog';
import { closeFavoritesDialog } from '../../actions/ui';
import { loadMap } from '../../actions/map';

const FavoritesDialog = ({ favoritesDialogOpen, onFavoriteSelect, closeFavoritesDialog }) => (
    <D2FavoritesDialog
        type='map'
        open={favoritesDialogOpen}
        onRequestClose={closeFavoritesDialog}
        onFavoriteSelect={onFavoriteSelect}
    />
);

const mapDispatchToProps = (dispatch) => ({
    closeFavoritesDialog: () => dispatch(closeFavoritesDialog()),
    onFavoriteSelect: (id) => {
        dispatch(closeFavoritesDialog());
        dispatch(loadMap(id));
    },
});

export default connect(
  (state) => ({
      favoritesDialogOpen: state.ui.favoritesDialogOpen,
  }),
  mapDispatchToProps
)(FavoritesDialog);
