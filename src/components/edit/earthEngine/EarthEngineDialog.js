import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import Tabs from '../../core/Tabs';
import Tab from '../../core/Tab';
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
import { setFilter, setParams } from '../../../actions/layerEdit';
import styles from '../styles/LayerDialog.module.css';

const EarthEngineDialog = props => {
    const [tab, setTab] = useState('data');
    const [periods, setPeriods] = useState();
    const [error, setError] = useState();
    // const [orgUnitsError, setOrgUnitsError] = useState();
    const [orgUnitsError] = useState();

    const {
        datasetId,
        band,
        rows,
        params,
        legend,
        filter,
        setFilter,
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

    const setPeriod = period => setFilter(period ? filters(period) : undefined);

    const noBandSelected = Array.isArray(bands) && (!band || !band.length);

    // console.log('filter', filter, period);

    // Load all available periods
    // TODO: Cancel state update if dialog is closed
    useEffect(() => {
        if (periodType) {
            getPeriods(datasetId)
                .then(setPeriods)
                .catch(setError);
        }
    }, [datasetId, periodType]);

    // Set most recent period by default
    useEffect(() => {
        if (!period) {
            if (Array.isArray(periods) && periods.length) {
                setPeriod(periods[0]);
            } else if (periods && periods.endPeriod) {
                /*
                setPeriod({
                    id: periods.endPeriod,
                    name: periods.endPeriod, // TODO
                    year: Number(periods.endPeriod.substring(0, 4)),
                    startDate: '2020-07-09', // TODO
                });
                */
            }
        }
    }, [periods, period]);

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
                {!legend && <Tab value="style">{i18n.t('Style')}</Tab>}
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'data' && (
                    <div className={styles.flexColumnFlow}>
                        <div className={styles.flexColumn}>
                            <div className={styles.paragraph}>
                                {description}
                            </div>
                            {unit && (
                                <div className={styles.paragraph}>
                                    {i18n.t('Unit')}: {unit}
                                </div>
                            )}
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
                        <div className={styles.flexColumn}>
                            <div className={styles.notice}>
                                <NoticeBox>
                                    <p>
                                        {i18n.t(
                                            'This layer can be combined with your organisaton units. '
                                        )}
                                    </p>
                                    <p>
                                        {i18n.t(
                                            'Select how you want the data to be aggregated. '
                                        )}
                                    </p>
                                    <p>
                                        {i18n.t(
                                            'Selected organisation units will be uploaded to Google Earth Engine where the values will be calculated.'
                                        )}
                                    </p>
                                    <p>
                                        {i18n.t(
                                            'You can view the result by clicking the organisation units, opening the data table or by downloading the data.'
                                        )}
                                    </p>
                                </NoticeBox>
                            </div>
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
                {tab === 'orgunits' && (
                    <OrgUnitsSelect rows={rows} error={orgUnitsError} />
                )}
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
    legend: PropTypes.object,
    validateLayer: PropTypes.bool.isRequired,
    setFilter: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
};

export default connect(null, { setFilter, setParams }, null, {
    forwardRef: true,
})(EarthEngineDialog);
