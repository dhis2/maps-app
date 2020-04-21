import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../../core/SelectField';
import { getAggregationTypes } from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

let types;

export const AggregationTypeSelect = ({
    aggregationType,
    setAggregationType,
    style,
}) => (
    <SelectField
        label={i18n.t('Aggregation type')}
        items={getAggregationTypes()}
        value={aggregationType || types[0].id}
        onChange={type => setAggregationType(type.id)}
        style={style}
    />
);

AggregationTypeSelect.propTypes = {
    aggregationType: PropTypes.string,
    setAggregationType: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default connect(
    state => ({
        aggregationType: state.layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypeSelect);
