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
    aggregations,
    defaultAggregations,
    aggregationType,
    setAggregationType,
}) => {
    const classes = hasClasses(defaultAggregations);

    const types = classes
        ? getEarthEngineStatisticTypes()
        : getEarthEngineAggregationTypes(aggregations);

    useEffect(() => {
        if (!aggregationType && defaultAggregations) {
            setAggregationType(defaultAggregations);
        }
    }, [aggregationType, defaultAggregations]);

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
    aggregations: PropTypes.array,
    defaultAggregations: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
    aggregationType: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    setAggregationType: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        aggregations: layerEdit.aggregations,
        defaultAggregations: layerEdit.defaultAggregations,
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationSelect);
