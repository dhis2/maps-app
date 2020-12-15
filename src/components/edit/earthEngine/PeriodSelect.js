import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import {
    loadCollection,
    getEarthEngineLayer,
    defaultFilters,
} from '../../../util/earthEngine';
import { setFilter, setPeriodName } from '../../../actions/layerEdit';
import styles from './styles/PeriodSelect.module.css';

const PeriodSelect = props => {
    const { id, filter, setFilter, setPeriodName } = props;
    const [periods, setPeriods] = useState();
    const [error, setError] = useState();
    const isLoading = !periods && !error;

    const onPeriodChange = useCallback(
        period => {
            const { id: periodId, name, year } = period;
            const periodName = `${name}${year ? ` ${year}` : ''}`;
            const dataset = getEarthEngineLayer(id);
            const filter = dataset.filters || defaultFilters;

            setPeriodName(periodName);
            setFilter(filter(periodId));
        },
        [id, setFilter, setPeriodName]
    );

    useEffect(() => {
        loadCollection(id)
            .then(setPeriods)
            .catch(setError);
    }, [id]);

    const value = filter && filter[0].arguments[1];

    // console.log('PeriodSelect', id, filter, periods, error);

    return (
        <div className={styles.periodSelect}>
            <SelectField
                label={i18n.t('Period')}
                loading={isLoading}
                items={periods}
                value={value}
                onChange={onPeriodChange}
                style={styles.period}
                // errorText={!value && errorText ? errorText : null}
            />
        </div>
    );
};

PeriodSelect.propTypes = {
    id: PropTypes.string.isRequired,
    filter: PropTypes.array,
    setFilter: PropTypes.func.isRequired,
    setPeriodName: PropTypes.func.isRequired,
};

export default connect(null, { setFilter, setPeriodName })(PeriodSelect);
