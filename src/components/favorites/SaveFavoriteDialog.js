import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import TextField from 'd2-ui/lib/text-field/TextField';
import { saveFavorite, closeSaveFavoriteDialog } from '../../actions/favorites';

const styles = {
    content: {
        width: 305,
    },
    title: {
        paddingBottom: 10,
    },
    body: {
        padding: '0 24px 10px',
    },
};

class SaveFavoriteDialog extends Component {
    state = {
        name: ''
    };

    validateName(name) {
        // TODO: Set error text if name is empty
        this.props.saveFavorite(name);
    }

    render() {
        const { hasLayers, saveFavoriteDialogOpen, closeSaveFavoriteDialog } = this.props;
        const { name } = this.state;

        return (
            <Dialog
                title={i18next.t('Save favorite')}
                contentStyle={styles.content}
                titleStyle={styles.title}
                bodyStyle={styles.body}
                actions={[
                    <Button
                        color='primary'
                        onClick={closeSaveFavoriteDialog}
                    >Close</Button>,
                    (hasLayers ? <Button
                          color='primary'
                          onClick={() => this.validateName(name)}
                      >Save</Button> : null)
                ]}
                open={saveFavoriteDialogOpen}
                onRequestClose={closeSaveFavoriteDialog}
              >
                  {hasLayers ?
                      <TextField
                          label={i18next.t('Favorite name')}
                          value={name}
                          onChange={(name) => this.setState({ name })}
                      />
                  : <div>{i18next.t('Your map is empty, please add a layer before you save a favorite.')}</div>}
            </Dialog>
        );
    }
}

export default connect(
  (state) => ({
      saveFavoriteDialogOpen: state.ui.saveFavoriteDialogOpen,
      hasLayers: Boolean(state.map.mapViews.length),
  }),
  { saveFavorite, closeSaveFavoriteDialog }
)(SaveFavoriteDialog);
