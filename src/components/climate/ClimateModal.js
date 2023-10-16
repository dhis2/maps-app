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
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Forecast from './Forecast'
import styles from './styles/Modal.module.css'

const ClimateModal = () => {
    const feature = useSelector((state) => state.climate)

    if (!feature) {
        return null
    }

    const { id, name, geometry } = feature

    return (
        <Modal
            large
            position="middle"
            className={styles.modal}
            dataTest="layeredit"
        >
            <ModalTitle>{i18n.t('Weather & climate')}</ModalTitle>
            <ModalContent>
                <Forecast name={name} geometry={geometry} />
            </ModalContent>
            <ModalActions></ModalActions>
        </Modal>
    )
}

export default ClimateModal
