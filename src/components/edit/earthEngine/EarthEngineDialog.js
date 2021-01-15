import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import Tabs from '../../core/Tabs';
import Tab from '../../core/Tab';
import AggregationTypesSelect from './AggregationTypesSelect';
import PeriodSelect from './PeriodSelect';
import OrgUnitsSelect from './OrgUnitsSelect';
import StyleSelect from './StyleSelect';
import { getEarthEngineLayer } from '../../../constants/earthEngine';
import {
    getPeriodFromFilter,
    loadCollection,
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
        name,
        description,
        periodType,
        filters = defaultFilters,
        unit,
        source,
        sourceUrl,
    } = dataset;
    const period = getPeriodFromFilter(filter);

    const setPeriod = period => setFilter(period ? filters(period) : undefined);

    // Load all available periods
    // TODO: Cancel state update if dialog is closed
    useEffect(() => {
        if (periodType) {
            loadCollection(datasetId)
                .then(setPeriods)
                .catch(setError);
        }
    }, [datasetId, periodType]);

    useEffect(() => {
        if (validateLayer) {
            if (!periodType || period) {
                onLayerValidation(true);
            } else {
                setError({
                    type: 'period',
                    message: i18n.t('This field is required'),
                });
                setTab('period');
                onLayerValidation(false);
            }
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
                    <div className={styles.flexRowFlow}>
                        <h3>{name}</h3>
                        <div className={styles.paragraph}>{description}</div>
                        <div className={styles.paragraph}>
                            {i18n.t('Unit')}: {unit}
                        </div>
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
                        <AggregationTypesSelect />
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
                {tab === 'style' && <StyleSelect params={params} />}
            </div>
        </div>
    );
};

EarthEngineDialog.propTypes = {
    rows: PropTypes.array,
    datasetId: PropTypes.string.isRequired,
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
