import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import { Help, Tab, Tabs } from '../../core';
import AggregationSelect from './AggregationSelect';
import BandSelect from './BandSelect';
import PeriodSelect from './PeriodSelect';
import OrgUnitsSelect from './OrgUnitsSelect';
import StyleSelect from './StyleSelect';
import { getEarthEngineLayer } from '../../../constants/earthEngine';
import {
    getPeriodFromFilter,
    getPeriods,
    defaultFilters,
} from '../../../util/earthEngine';
import {
    setFilter,
    setOrgUnitLevels,
    setBufferRadius,
} from '../../../actions/layerEdit';
import { DEFAULT_ORG_UNIT_LEVEL, EE_BUFFER } from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

const EarthEngineDialog = props => {
    const [tab, setTab] = useState('data');
    const [periods, setPeriods] = useState();
    const [error, setError] = useState();

    const {
        datasetId,
        band,
        rows,
        params,
        filter,
        areaRadius,
        setFilter,
        setOrgUnitLevels,
        setBufferRadius,
        validateLayer,
        onLayerValidation,
    } = props;

    const dataset = getEarthEngineLayer(datasetId);

    const {
        description,
        periodType,
        bands,
        filters = defaultFilters,
        unit,
        source,
        sourceUrl,
    } = dataset;

    const period = getPeriodFromFilter(filter);

    const setPeriod = period => setFilter(period ? filters(period) : null);

    const noBandSelected = Array.isArray(bands) && (!band || !band.length);

    // Load all available periods
    useEffect(() => {
        if (periodType) {
            getPeriods(datasetId)
                .then(setPeriods)
                .catch(setError);
        }
    }, [datasetId, periodType]);

    // Set most recent period by default
    useEffect(() => {
        if (filter === undefined) {
            if (Array.isArray(periods) && periods.length) {
                setPeriod(periods[0]);
            }
        }
    }, [periods, filter]);

    useEffect(() => {
        if (!rows) {
            setOrgUnitLevels([DEFAULT_ORG_UNIT_LEVEL]);
        }
    }, [rows, setOrgUnitLevels]);

    useEffect(() => {
        if (areaRadius === undefined) {
            setBufferRadius(EE_BUFFER);
        }
    }, [areaRadius, setBufferRadius]);

    useEffect(() => {
        if (validateLayer) {
            const isValid = !noBandSelected && (!periodType || period);

            if (!isValid) {
                if (noBandSelected) {
                    setError({
                        type: 'band',
                        message: i18n.t('This field is required'),
                    });
                    setTab('data');
                } else {
                    setError({
                        type: 'period',
                        message: i18n.t('This field is required'),
                    });
                    setTab('period');
                }
            }

            onLayerValidation(isValid);
        }
    }, [validateLayer, periodType, period, onLayerValidation]);

    if (error && error.type === 'engine') {
        return (
            <div className={styles.flexRowFlow}>
                <NoticeBox {...error}>{error.message}</NoticeBox>
            </div>
        );
    }

    return (
        <div>
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data">{i18n.t('Data')}</Tab>
                {periodType && <Tab value="period">{i18n.t('Period')}</Tab>}
                <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                {params && <Tab value="style">{i18n.t('Style')}</Tab>}
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
                            <p>
                                {i18n.t(
                                    'Multiple aggregation methods are available. See the aggregation results by clicking map regions or viewing the data table. The results can also be downloaded.'
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
                    <PeriodSelect
                        periodType={periodType}
                        period={period}
                        periods={periods}
                        filters={filters}
                        onChange={setPeriod}
                        errorText={
                            error && error.type === 'period' && error.message
                        }
                        className={styles.flexRowFlow}
                    />
                )}
                {tab === 'orgunits' && <OrgUnitsSelect rows={rows} />}
                {tab === 'style' && <StyleSelect unit={unit} params={params} />}
            </div>
        </div>
    );
};

EarthEngineDialog.propTypes = {
    rows: PropTypes.array,
    datasetId: PropTypes.string.isRequired,
    band: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    filter: PropTypes.array,
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
    areaRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    legend: PropTypes.object,
    validateLayer: PropTypes.bool.isRequired,
    setFilter: PropTypes.func.isRequired,
    setOrgUnitLevels: PropTypes.func.isRequired,
    setBufferRadius: PropTypes.func.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
};

export default connect(
    null,
    { setFilter, setOrgUnitLevels, setBufferRadius },
    null,
    {
        forwardRef: true,
    }
)(EarthEngineDialog);
