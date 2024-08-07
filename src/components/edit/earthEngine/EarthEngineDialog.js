import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    setOrgUnits,
    setEarthEnginePeriod,
    setBufferRadius,
} from '../../../actions/layerEdit.js'
import {
    DEFAULT_ORG_UNIT_LEVEL,
    EE_BUFFER,
    NONE,
} from '../../../constants/layers.js'
import { Help, Tab, Tabs } from '../../core/index.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import styles from '../styles/LayerDialog.module.css'
import AggregationSelect from './AggregationSelect.js'
import BandSelect from './BandSelect.js'
import PeriodSelect from './PeriodSelect.js'
import StyleTab from './StyleTab.js'

const EarthEngineDialog = (props) => {
    const [tab, setTab] = useState('data')
    const [error, setError] = useState()

    const {
        aggregations,
        areaRadius,
        band,
        bands,
        datasetId,
        defaultAggregations,
        description,
        filters,
        maskOperator,
        notice,
        orgUnitField,
        orgUnits,
        rows,
        setOrgUnits,
        source,
        sourceUrl,
        style,
        period,
        periodType,
        setBufferRadius,
        setEarthEnginePeriod,
        unit,
        resolution,
        validateLayer,
        onLayerValidation,
    } = props

    const noBandSelected = Array.isArray(bands) && (!band || !band.length)

    const hasAggregations = !!(aggregations || defaultAggregations)
    const hasMultipleAggregations = !aggregations || aggregations.length > 1

    const hasOrgUnitField = !!orgUnitField && orgUnitField !== NONE

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
                        {hasAggregations && <AggregationSelect />}
                        {unit && (
                            <div className={styles.paragraph}>
                                {i18n.t('Unit')}: {unit}
                            </div>
                        )}
                        {resolution?.spatial && (
                            <div className={styles.paragraph}>
                                {i18n.t('Spatial resolution')}:{' '}
                                {resolution?.spatial}
                            </div>
                        )}
                        {resolution?.temporal && (
                            <div className={styles.paragraph}>
                                {i18n.t('Temporal resolution')}:{' '}
                                {resolution?.temporal}
                            </div>
                        )}
                        {resolution?.temporalCoverage && (
                            <div className={styles.paragraph}>
                                {i18n.t('Temporal coverage')}:{' '}
                                {resolution?.temporalCoverage}
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
                    <PeriodSelect
                        datasetId={datasetId}
                        periodType={periodType}
                        period={period}
                        filters={filters}
                        onChange={setEarthEnginePeriod}
                        onError={setError}
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
                        showBelowMin={!maskOperator}
                        hasOrgUnitField={hasOrgUnitField}
                    />
                )}
            </div>
        </div>
    )
}

EarthEngineDialog.propTypes = {
    datasetId: PropTypes.string.isRequired,
    setBufferRadius: PropTypes.func.isRequired,
    setEarthEnginePeriod: PropTypes.func.isRequired,
    setOrgUnits: PropTypes.func.isRequired,
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    aggregations: PropTypes.array,
    areaRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    band: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    bands: PropTypes.array,
    defaultAggregations: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string,
    ]),
    description: PropTypes.string,
    filters: PropTypes.array,
    legend: PropTypes.object,
    maskOperator: PropTypes.string,
    notice: PropTypes.string,
    orgUnitField: PropTypes.string,
    orgUnits: PropTypes.object,
    period: PropTypes.object,
    periodType: PropTypes.string,
    precision: PropTypes.number,
    resolution: PropTypes.shape({
        spatial: PropTypes.string,
        temporal: PropTypes.string,
        temporalCoverage: PropTypes.string,
    }),
    rows: PropTypes.array,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    style: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            max: PropTypes.number,
            min: PropTypes.number,
            palette: PropTypes.array,
        }),
    ]),
    unit: PropTypes.string,
}

export default connect(
    null,
    { setOrgUnits, setEarthEnginePeriod, setBufferRadius },
    null,
    {
        forwardRef: true,
    }
)(EarthEngineDialog)
