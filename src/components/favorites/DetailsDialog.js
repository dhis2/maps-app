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

class DetailsDialog extends Component {
    constructor(props) {
        super(props);
        const { name, description } = props.favorite;
        this.state = { name, description };
    }

    componentWillReceiveProps(nextProps) {
        const { name, description } = nextProps.favorite;
        this.setState({ name, description });
    }

    render() {
        const { open, favorite, onSave, onClose } = this.props;
        const { name, description } = this.state;

        if (!open)
            return null;

        return (
            <Dialog
                title={i18next.t('Edit details')}
                open={true}
                onRequestClose={onClose}
                actions={[
                    <Button color="primary" onClick={onClose}>
                        {i18next.t('Cancel')}
                    </Button>,
                    <Button
                        color="primary"
                        disabled={false}
                        onClick={() => onSave(favorite, this.state)}
                    >
                        {i18next.t('Save')}
                    </Button>,
                ]}
                contentStyle={styles.dialog}
            >
                <TextField
                    name="name"
                    value={name}
                    floatingLabelText={i18next.t('Name')}
                    onChange={(evt, name) => this.setState({ name })}
                    style={styles.textfield}
                />

                <TextField
                    name="description"
                    value={description}
                    floatingLabelText={i18next.t('Description')}
                    multiLine={true}
                    rows={1}
                    onChange={(evt, description) => this.setState({ description })}
                    style={styles.textfield}
                />
            </Dialog>
        );
    }
}

DetailsDialog.propTypes = {
    open: PropTypes.bool,
    favorite: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

DetailsDialog.defaultProps = {
    open: false,
};

export default DetailsDialog;
