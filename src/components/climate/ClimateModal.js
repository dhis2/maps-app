import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeClimatePanel } from '../../actions/climate.js'
import { Tab, Tabs } from '../core/index.js'
import AirQuality from './AirQuality.js'
import ClimateChange from './ClimateChange.js'
import Forecast from './Forecast.js'
import Precipitation from './Precipitation.js'
import styles from './styles/Modal.module.css'
import TemperatureTab from './TemperatureTab.js'
import useClimateData from '../../hooks/useClimateData.js'

const FORECAST = 'forecast'
const PRECIPITATION = 'precipitation'
const TEMPERATURE = 'temperature'
const CLIMATE = 'climate'
const AIR = 'air'

const ClimateModal = () => {
    const [tab, setTab] = useState(FORECAST)
    const feature = useSelector((state) => state.climate)
    const dispatch = useDispatch()

    const { name, geometry } = feature
    const { monthlyData } = useClimateData(geometry)
    const title = (name ? `${name} - ` : '') + i18n.t('Weather & Climate')

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
                    <Tab value={TEMPERATURE}>{i18n.t('Temperature')}</Tab>
                    <Tab value={PRECIPITATION}>{i18n.t('Precipitation')}</Tab>
                    <Tab value={CLIMATE}>{i18n.t('Climate change')}</Tab>
                    <Tab value={AIR}>{i18n.t('Air quality')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
                    {tab === FORECAST && <Forecast geometry={geometry} />}
                    {tab === TEMPERATURE && (
                        <TemperatureTab data={monthlyData} />
                    )}
                    {tab === PRECIPITATION && (
                        <Precipitation data={monthlyData} />
                    )}
                    {tab === CLIMATE && <ClimateChange data={monthlyData} />}
                    {tab === AIR && <AirQuality geometry={geometry} />}
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
