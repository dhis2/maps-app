import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import { getEarthEngineAggregationTypes } from '../../../constants/aggregationTypes';

const ValueTypeSelect = ({ value, valueTypes, defaultTypes, onChange }) => {
    const items =
        valueTypes ||
        getEarthEngineAggregationTypes().filter(t =>
            defaultTypes.includes(t.id)
        );

    return (
        <SelectField
            label={i18n.t('Value type')}
            items={items}
            value={value ? value.id : null}
            onChange={onChange}
        />
    );
};

ValueTypeSelect.propTypes = {
    value: PropTypes.object,
    valueTypes: PropTypes.array,
    defaultTypes: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ValueTypeSelect;
