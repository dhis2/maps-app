import React from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { aggregationTypes } from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

let types;

export const AggregationTypeSelect = ({ aggregationType, setAggregationType, style }) => {
    if (!types) {
        types = aggregationTypes.map(type => ({
            id: type.id,
            name: i18next.t(type.name),
        }));
    }

    return (
        <SelectField
            label={i18next.t('Aggregation type')}
            items={types}
            value={aggregationType || types[0].id}
            onChange={type => setAggregationType(type.id)}
            style={style}
        />
    );
};

export default connect(
    (state) => ({
        aggregationType: state.layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypeSelect);
