import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../../core/SelectField';
import { getAggregationTypes } from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

export const AggregationTypeSelect = ({
    aggregationType,
    setAggregationType,
    style,
}) => {
    const types = getAggregationTypes();

    return (
        <SelectField
            label={i18n.t('Aggregation type')}
            items={types}
            value={aggregationType || types[0].id}
            onChange={type => setAggregationType(type.id)}
            style={style}
        />
    );
};

AggregationTypeSelect.propTypes = {
    aggregationType: PropTypes.string,
    setAggregationType: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default connect(
    ({ layerEdit }) => ({
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypeSelect);
