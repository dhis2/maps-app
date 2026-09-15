import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

const ConfirmLeaveModal = ({ onCancel, onConfirm }) => (
    <Modal small dataTest="confirm-leave-modal">
        <ModalTitle>{i18n.t('Discard unsaved changes?')}</ModalTitle>
        <ModalContent>
            {i18n.t(
                'Are you sure you want to leave this map? Any unsaved changes will be lost.'
            )}
        </ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button
                    secondary
                    onClick={onCancel}
                    dataTest="confirm-leave-modal-option-cancel"
                >
                    {i18n.t('No, cancel')}
                </Button>
                <Button
                    primary
                    onClick={onConfirm}
                    dataTest="confirm-leave-modal-option-confirm"
                >
                    {i18n.t('Yes, leave')}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)

ConfirmLeaveModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
}

export default ConfirmLeaveModal
