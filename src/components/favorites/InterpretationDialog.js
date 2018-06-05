import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Dialog from 'material-ui/Dialog';
import { Button } from '@dhis2/d2-ui-core';
import TextField from 'material-ui/TextField';

const styles = {
    dialog: {
        maxWidth: 600,
    },
    textfield: {
        width: '100%',
    },
};

class InterpretationDialog extends Component {
    state = {
        value: '',
    };

    render() {
        const { favoriteId, onSave, onClose } = this.props;
        const { value } = this.state;

        return (
            <Dialog
                title={i18n.t('Write interpretation')}
                open={true}
                onRequestClose={onClose}
                actions={[
                    <Button color="primary" onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        disabled={value ? false : true}
                        onClick={() => onSave(favoriteId, value)}
                    >
                        {i18n.t('Save')}
                    </Button>,
                ]}
                contentStyle={styles.dialog}
            >
                <TextField
                    name="interpretation"
                    value={value}
                    multiLine={true}
                    rows={4}
                    onChange={(evt, value) => this.setState({ value })}
                    style={styles.textfield}
                />
            </Dialog>
        );
    }
}

export default InterpretationDialog;
