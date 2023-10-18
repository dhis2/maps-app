import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Tab, Tabs } from '../core/index.js'
import Forecast from './Forecast.js'
import Precipitation from './Precipitation.js'
import Temperature from './Temperature.js'
import ClimateChange from './ClimateChange.js'
import AirQuality from './AirQuality.js'
import { closeClimatePanel } from '../../actions/climate.js'
import { getTimeSeries } from '../../util/earthEngine.js'
// import data from './data-monthly.js'
import styles from './styles/Modal.module.css'

const FORECAST = 'forecast'
const PRECIPITATION = 'precipitation'
const TEMPERATURE = 'temperature'
const CLIMATE = 'climate'
const AIR = 'air'

const config = {
    datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
    band: [
        'temperature_2m',
        'temperature_2m_min',
        'temperature_2m_max',
        'total_precipitation_sum',
        'total_precipitation_min',
        'total_precipitation_max',
    ],
}

const ClimateModal = () => {
    const [tab, setTab] = useState(FORECAST)
    const [data, setData] = useState()
    const feature = useSelector((state) => state.climate)
    const dispatch = useDispatch()

    const { name, geometry } = feature
    const title = (name ? `${name} - ` : '') + i18n.t('Weather & Climate')

    useEffect(() => {
        getTimeSeries(config, geometry).then(setData)
    }, [geometry])

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
                    {tab === TEMPERATURE && <Temperature data={data} />}
                    {tab === PRECIPITATION && <Precipitation data={data} />}
                    {tab === CLIMATE && <ClimateChange data={data} />}
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
