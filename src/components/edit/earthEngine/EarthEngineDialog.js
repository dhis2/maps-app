import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import {
    setOrgUnits,
    setFilter,
    setBufferRadius,
} from '../../../actions/layerEdit.js'
import { getEarthEngineLayer } from '../../../constants/earthEngine.js'
import {
    DEFAULT_ORG_UNIT_LEVEL,
    EE_BUFFER,
    NONE,
} from '../../../constants/layers.js'
import {
    getPeriodFromFilter,
    getPeriods,
    defaultFilters,
    translateFilters,
} from '../../../util/earthEngine.js'
import { incrementDate } from '../../../util/time.js'
import { Help, Tab, Tabs } from '../../core/index.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import styles from '../styles/LayerDialog.module.css'
import AggregationSelect from './AggregationSelect.js'
import BandSelect from './BandSelect.js'
import PeriodTab from './PeriodTab.js'
import StyleTab from './StyleTab.js'

const EarthEngineDialog = (props) => {
    const [tab, setTab] = useState('data')
    const [periods, setPeriods] = useState()
    const [error, setError] = useState()

    const {
        layerId,
        datasetId,
        band,
        rows,
        style,
        filter,
        areaRadius,
        orgUnits,
        setOrgUnits,
        orgUnitField,
        setFilter,
        setBufferRadius,
        validateLayer,
        onLayerValidation,
    } = props

    // const dataset = getEarthEngineLayer(layerId)

    const {
        description,
        notice,
        periodType,
        periodReducer,
        bands,
        filters = defaultFilters,
        unit,
        source,
        sourceUrl,
        aggregations,
    } = props // dataset

    const period = getPeriodFromFilter(filter)

    // Translates a dynamic filter into a constant filter
    /*
    const getFilter = ({ id, year }) =>
        filters.map((filter) => ({
            ...filter,
            arguments: filter.arguments.map((arg) =>
                arg === '$value' ? String(id) : arg === '$year' ? year : arg
            ),
        }))
    */

    // const getFilterFromPeriod = (period) => {}

    const setFilterFromPeriod = useCallback(
        (period) => {
            let periodFilter = null

            // console.log('setFilterFromPeriod', periodType, period, filters)

            if (period) {
                const { id, startDate, endDate } = period

                if (startDate && endDate) {
                    // console.log('endDate', endDate, incrementDate(endDate))

                    periodFilter = translateFilters(
                        filters,
                        startDate,
                        incrementDate(endDate)
                    )
                } else {
                    periodFilter = translateFilters(
                        filters,
                        // periodType === 'yearly' ? String(period.year) : period.id
                        period.id
                    )
                }

                // TODO: Make more flexible
                periodFilter[0].id = period.id
                periodFilter[0].name = period.name
                periodFilter[0].year = period.year
            }

            // console.log('setFilterFromPeriod', period, filters, periodFilter)

            setFilter(periodFilter)
        },
        [periodType, filters, setFilter]
    )

    const noBandSelected = Array.isArray(bands) && (!band || !band.length)

    const hasMultipleAggregations = !aggregations || aggregations.length > 1

    const hasOrgUnitField = !!orgUnitField && orgUnitField !== NONE

    // Load all available periods
    /*
    useEffect(() => {
        let isCancelled = false

        if (periodType) {
            getPeriods(datasetId, periodType, filters)
                .then((periods) => {
                    if (!isCancelled) {
                        setPeriods(periods)
                    }
                })
                .catch((error) =>
                    setError({
                        type: 'engine',
                        message: error.message,
                    })
                )
        }

        return () => (isCancelled = true)
    }, [datasetId, periodType, filters])
    */

    // Set most recent period by default
    /*
    useEffect(() => {
        if (filter === undefined) {
            if (Array.isArray(periods) && periods.length) {
                setFilterFromPeriod(periods[0])
            }
        }
    }, [periods, filter, setFilterFromPeriod])
    */

    // Set default org unit level
    useEffect(() => {
        if (!rows) {
            const defaultLevel = orgUnits.levels?.[DEFAULT_ORG_UNIT_LEVEL]

            if (defaultLevel) {
                const { id, name } = defaultLevel

                setOrgUnits({
                    dimension: 'ou',
                    items: [{ id: `LEVEL-${id}`, name }],
                })
            }
        }
    }, [rows, orgUnits, setOrgUnits])

    useEffect(() => {
        if (!hasOrgUnitField && areaRadius === undefined) {
            setBufferRadius(EE_BUFFER)
        }
    }, [hasOrgUnitField, areaRadius, setBufferRadius])

    useEffect(() => {
        if (validateLayer) {
            const isValid = !noBandSelected && (!periodType || period)

            if (!isValid) {
                if (noBandSelected) {
                    setError({
                        type: 'band',
                        message: i18n.t('This field is required'),
                    })
                    setTab('data')
                } else {
                    setError({
                        type: 'period',
                        message: i18n.t('This field is required'),
                    })
                    setTab('period')
                }
            }

            onLayerValidation(isValid)
        }
    }, [validateLayer, periodType, period, onLayerValidation, noBandSelected])

    if (error && error.type === 'engine') {
        return (
            <div className={styles.flexRowFlow}>
                <NoticeBox {...error}>{error.message}</NoticeBox>
            </div>
        )
    }

    return (
        <div className={styles.content}>
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data">{i18n.t('Data')}</Tab>
                {periodType && <Tab value="period">{i18n.t('Period')}</Tab>}
                <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'data' && (
                    <div className={styles.flexRowFlow}>
                        <Help>
                            <p>{description}</p>
                            <p>
                                {i18n.t(
                                    'Data will be calculated on Google Earth Engine for the chosen organisation units.'
                                )}
                            </p>
                            {notice && (
                                <p className={styles.eeNotice}>{notice}</p>
                            )}
                            <p>
                                {hasMultipleAggregations && (
                                    <>
                                        {i18n.t(
                                            'Multiple aggregation methods are available.'
                                        )}
                                        &nbsp;
                                    </>
                                )}
                                {i18n.t(
                                    'See the aggregation results by clicking map regions or viewing the data table. The results can also be downloaded.'
                                )}
                            </p>
                        </Help>
                        {bands && (
                            <BandSelect
                                errorText={
                                    error &&
                                    error.type === 'band' &&
                                    error.message
                                }
                            />
                        )}
                        <AggregationSelect />
                        {unit && (
                            <div className={styles.paragraph}>
                                {i18n.t('Unit')}: {unit}
                            </div>
                        )}
                        <div className={styles.paragraph}>
                            {i18n.t('Source')}:{' '}
                            <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {source}
                            </a>
                        </div>
                    </div>
                )}
                {tab === 'period' && (
                    <PeriodTab
                        datasetId={datasetId}
                        periodType={periodType}
                        period={period}
                        // periods={periods}
                        periodReducer={periodReducer}
                        filters={filters}
                        onChange={setFilterFromPeriod}
                        errorText={
                            error && error.type === 'period' && error.message
                        }
                        className={styles.flexRowFlow}
                    />
                )}
                {tab === 'orgunits' && <OrgUnitSelect />}
                {tab === 'style' && (
                    <StyleTab
                        unit={unit}
                        style={style}
                        hasOrgUnitField={hasOrgUnitField}
                    />
                )}
            </div>
        </div>
    )
}

EarthEngineDialog.propTypes = {
    datasetId: PropTypes.string.isRequired,
    layerId: PropTypes.string.isRequired,
    setBufferRadius: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    setOrgUnits: PropTypes.func.isRequired,
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    areaRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    band: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    filter: PropTypes.array,
    legend: PropTypes.object,
    orgUnitField: PropTypes.string,
    orgUnits: PropTypes.object,
    params: PropTypes.shape({
        max: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        palette: PropTypes.array.isRequired,
    }),
    rows: PropTypes.array,
}

export default connect(
    null,
    { setOrgUnits, setFilter, setBufferRadius },
    null,
    {
        forwardRef: true,
    }
)(EarthEngineDialog)
