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
import { useSelector, useDispatch } from 'react-redux'
import { Tab, Tabs } from '../core/index.js'
import Forecast from './Forecast'
import { closeClimatePanel } from '../../actions/climate.js'
import styles from './styles/Modal.module.css'

const FORECAST = 'forecast'
const PAST = 'past'
const FUTURE = 'future'

const ClimateModal = () => {
    const [tab, setTab] = useState(FORECAST)
    const feature = useSelector((state) => state.climate)
    const dispatch = useDispatch()

    if (!feature) {
        return null
    }

    const { name, geometry } = feature
    const title = `${name} - ${i18n.t('Weather & Climate')}`

    return (
        <Modal
            large
            position="middle"
            className={styles.modal}
            dataTest="layeredit"
        >
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>
                <Tabs value={tab} onChange={setTab}>
                    <Tab value={FORECAST}>{i18n.t('10 days forecast')}</Tab>
                    <Tab value={PAST}>{i18n.t('Past')}</Tab>
                    <Tab value={FUTURE}>{i18n.t('Future')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
                    {tab === FORECAST && (
                        <Forecast name={name} geometry={geometry} />
                    )}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        secondary
                        onClick={() => dispatch(closeClimatePanel())}
                    >
                        {i18n.t('Close')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export default ClimateModal
