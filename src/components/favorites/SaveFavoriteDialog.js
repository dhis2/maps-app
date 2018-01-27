import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { closeSaveFavoriteDialog } from '../../actions/ui';

const style = {
  padding: 5
};

const SaveFavoriteDialog = ({ saveFavoriteDialogOpen, closeSaveFavoriteDialog }) => {

  return (
    <Dialog
      title={i18next.t('Save favorite')}
      actions={[
        <Button
          color='primary'
          onClick={closeSaveFavoriteDialog}
        >Close</Button>
      ]}
      open={saveFavoriteDialogOpen}
      onRequestClose={closeSaveFavoriteDialog}
    >
    </Dialog>
  );
};

export default connect(
  (state) => ({
    saveFavoriteDialogOpen: state.ui.saveFavoriteDialogOpen,
  }),
  { closeSaveFavoriteDialog }
)(SaveFavoriteDialog);
