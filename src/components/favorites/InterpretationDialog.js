import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
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
    constructor(props) {
        super(props);
        this.state = { value: props.interpretation ? props.interpretation.text : "" };
    }

    render() {
        const { interpretation, favoriteId, onSave, onClose } = this.props;
        const { value } = this.state;
        const title = interpretation && interpretation.id
            ? i18next.t('Edit interpretation')
            : i18next.t('Create interpretation');

        return (
            <Dialog
                title={title}
                open={true}
                onRequestClose={onClose}
                actions={[
                    <Button color="primary" onClick={onClose}>
                        {i18next.t('Cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        disabled={value ? false : true}
                        onClick={() => onSave({ ...interpretation, text: value })}
                    >
                        {i18next.t('Save')}
                    </Button>,
                ]}
                contentStyle={styles.dialog}
            >
                <TextField
                    name="interpretation"
                    value={value}
                    multiLine={true}
                    rows={1}
                    onChange={(evt, value) => this.setState({ value })}
                    style={styles.textfield}
                />
            </Dialog>
        );
    }
}

export default InterpretationDialog;
