import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import TextField from 'd2-ui/lib/text-field/TextField';
import { saveFavorite, closeSaveFavoriteDialog } from '../../actions/favorites';
import { cleanMapConfig } from '../../util/favorites';

const styles = {
    content: {
        width: 305,
    },
    title: {
        paddingBottom: 10,
    },
    body: {
        padding: '0 24px 10px',
        lineHeight: '26px',
    },
};

class SaveFavoriteDialog extends Component {
    state = {
        name: 'AAAA'
    };

    validateName(name) {
        // TODO: Set error text if name is empty

        const config = {
            ...cleanMapConfig(this.props.config),
            name,
        };

        // console.log('save config', config);

        this.props.saveFavorite(config);
    }

    render() {
        const { response, hasLayers, saveDialogOpen, closeSaveFavoriteDialog } = this.props; // TODO: config included only for testing
        const { name } = this.state;

        if (!saveDialogOpen) {
            return null;
        }

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
                    (hasLayers && !response ? <Button
                          color='primary'
                          onClick={() => this.validateName(name)}
                      >Save</Button> : null)
                ]}
                open={saveDialogOpen}
                onRequestClose={closeSaveFavoriteDialog}
            >
                {response && response.status === 'OK' ?
                    <div>{i18next.t('Your map was saved successfully.')}</div>
                : null}

                {response && response.status !== 'OK' ?
                    <div>{i18next.t('An error occurred')} (response.httpStatusCode): {response.message}</div>
                : null}

                {hasLayers && !response ?
                    <TextField
                        label={i18next.t('Favorite name')}
                        value={name}
                        onChange={(name) => this.setState({ name })}
                    />
                : null}

                {!hasLayers && !response ?
                    <div>{i18next.t('Your map is empty, please add a layer before you save a favorite.')}</div>
                : null}
            </Dialog>
        );
    }
}

export default connect(
    (state) => ({
        saveDialogOpen: state.favorite.saveDialogOpen,
        hasLayers: Boolean(state.map.mapViews.length),
        config: state.map,
        response: state.favorite.response,
    }),
    { saveFavorite, closeSaveFavoriteDialog }
)(SaveFavoriteDialog);
