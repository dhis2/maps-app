import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import { getThematicAggregationTypes } from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

export const AggregationTypeSelect = ({
    aggregationType,
    setAggregationType,
    className,
}) => {
    const types = getThematicAggregationTypes();

    return (
        <SelectField
            label={i18n.t('Aggregation type')}
            items={getThematicAggregationTypes()}
            value={aggregationType || types[0].id}
            onChange={type => setAggregationType(type.id)}
            className={className}
        />
    );
};

AggregationTypeSelect.propTypes = {
    aggregationType: PropTypes.string,
    setAggregationType: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default connect(
    ({ layerEdit }) => ({
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypeSelect);
