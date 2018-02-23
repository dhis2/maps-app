import { Component } from 'react';
import { connect } from 'react-redux';
import D2FavoritesDialog from 'd2-ui-favorites';
import { closeFavoritesDialog } from '../../actions/favorites';
import { loadFavorite } from '../../actions/favorites';
import PropTypes from 'prop-types';

const FavoritesDialog = ({ dialogOpen, onFavoriteSelect, closeFavoritesDialog }, context) => (
    <D2FavoritesDialog
        type='map'
        open={dialogOpen}
        onRequestClose={closeFavoritesDialog}
        onFavoriteSelect={onFavoriteSelect}
        d2={context.d2}
    />
);

FavoritesDialog.contextTypes = { 
    d2: PropTypes.object.isRequired 
};

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
