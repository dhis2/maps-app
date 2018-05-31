import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import { Button } from '@dhis2/d2-ui-core';
import TextField from 'd2-ui/lib/text-field/TextField';
import { setMapName } from '../../actions/map';
import {
    saveNewFavorite,
    closeSaveNewFavoriteDialog,
} from '../../actions/favorites';
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

class SaveNewFavoriteDialog extends Component {
    state = {
        name: '',
    };

    validateName(name) {
        // TODO: Set error text if name is empty
        this.saveFavorite(name);
    }

    saveFavorite(name) {
        const config = {
            ...cleanMapConfig(this.props.config),
            name,
        };

        delete config.id;

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        this.props.setMapName(name);
        this.props.saveNewFavorite(config);
        this.props.closeSaveNewFavoriteDialog();
    }

    render() {
        const {
            response,
            hasLayers,
            saveNewDialogOpen,
            closeSaveNewFavoriteDialog,
        } = this.props; // TODO: config included only for testing
        const { name } = this.state;

        if (!saveNewDialogOpen) {
            return null;
        }

        return (
            <Dialog
                title={i18next.t('Save as new favorite')}
                contentStyle={styles.content}
                titleStyle={styles.title}
                bodyStyle={styles.body}
                actions={[
                    <Button
                        color="primary"
                        onClick={closeSaveNewFavoriteDialog}
                    >
                        Close
                    </Button>,
                    hasLayers && !response ? (
                        <Button
                            color="primary"
                            onClick={() => this.validateName(name)}
                            disabled={name.length === 0}
                        >
                            Save
                        </Button>
                    ) : null,
                ]}
                open={saveNewDialogOpen}
                onRequestClose={closeSaveNewFavoriteDialog}
            >
                {response && response.status === 'OK' ? (
                    <div>{i18next.t('Your map was saved successfully.')}</div>
                ) : null}

                {response && response.status !== 'OK' ? (
                    <div>
                        {i18next.t('An error occurred')}{' '}
                        (response.httpStatusCode): {response.message}
                    </div>
                ) : null}

                {hasLayers && !response ? (
                    <TextField
                        label={i18next.t('Favorite name')}
                        value={name}
                        onChange={name => this.setState({ name })}
                    />
                ) : null}

                {!hasLayers && !response ? (
                    <div>
                        {i18next.t(
                            'Your map is empty, please add a layer before you save a favorite.'
                        )}
                    </div>
                ) : null}
            </Dialog>
        );
    }
}

export default connect(
    state => ({
        saveNewDialogOpen: state.favorite.saveNewDialogOpen,
        hasLayers: Boolean(state.map.mapViews.length),
        config: state.map,
        response: state.favorite.response,
    }),
    { setMapName, saveNewFavorite, closeSaveNewFavoriteDialog }
)(SaveNewFavoriteDialog);
