import { Component } from 'react';
import { connect } from 'react-redux';
import D2FavoritesDialog from 'd2-ui/lib/favorites/FavoritesDialog';
import { closeFavoritesDialog } from '../../actions/favorites';
import { loadFavorite } from '../../actions/favorites';

const FavoritesDialog = ({ dialogOpen, onFavoriteSelect, closeFavoritesDialog }) => (
    <D2FavoritesDialog
        type='map'
        open={dialogOpen}
        onRequestClose={closeFavoritesDialog}
        onFavoriteSelect={onFavoriteSelect}
    />
);

const mapDispatchToProps = (dispatch) => ({
    closeFavoritesDialog: () => dispatch(closeFavoritesDialog()),
    onFavoriteSelect: (id) => {
        dispatch(closeFavoritesDialog());
        dispatch(loadFavorite(id));
    },
});

export default connect(
  (state) => ({
      dialogOpen: state.favorite.dialogOpen,
  }),
  mapDispatchToProps
)(FavoritesDialog);
