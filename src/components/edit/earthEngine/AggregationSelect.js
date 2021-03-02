import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import {
    getEarthEngineAggregationTypes,
    getEarthEngineStatisticTypes,
} from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';
import { hasClasses } from '../../../util/earthEngine';

const AggregationSelect = ({
    aggregationType,
    defaultAggregation,
    setAggregationType,
}) => {
    const classes = hasClasses(defaultAggregation);

    const types = classes
        ? getEarthEngineStatisticTypes()
        : getEarthEngineAggregationTypes();

    useEffect(() => {
        if (!aggregationType && defaultAggregation) {
            setAggregationType(defaultAggregation);
        }
    }, [aggregationType, defaultAggregation]);

    return (
        <SelectField
            label={i18n.t('Aggregation method')}
            items={types}
            multiple={!classes}
            value={aggregationType}
            onChange={type => setAggregationType(classes ? type.id : type)}
        />
    );
};

AggregationSelect.propTypes = {
    aggregationType: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    defaultAggregation: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
    setAggregationType: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        aggregationType: layerEdit.aggregationType,
        defaultAggregation: layerEdit.defaultAggregation,
    }),
    { setAggregationType }
)(AggregationSelect);
