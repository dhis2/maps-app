import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui';

const ImportDialog = ({ onClose }) => {
    return (
        <Modal position="middle" small onClose={onClose}>
            <ModalTitle>{i18n.t('Import data')}</ModalTitle>
            <ModalContent>Content</ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button primary onClick={() => {}}>
                        {i18n.t('Import')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    );
};

ImportDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ImportDialog;
