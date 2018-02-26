import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';

const LinkDialog = ({ onClose }) => {
    return (
        <Dialog
            title={i18next.t('Favorite link')}
            open={true}
            onRequestClose={onClose}
            actions={<Button onClick={onClose}>{i18next.t('Close')}</Button>}
        >LINKS</Dialog>
    )
};

export default LinkDialog;