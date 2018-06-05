import React from 'react';
import { SelectField } from '@dhis2/d2-ui-core';

const OptionSetSelect = ({ options, value, onChange, style }) => {
    // TODO: Temporarily fix until we have a searchable SelectField handling hundreds of options
    if (options.length > 100) {
        options = options.slice(0, 100);
    }

    return (
        <SelectField
            label="Options" // TODO: i18n
            items={options.map(option => ({
                id: option.code,
                name: option.name,
            }))}
            value={value}
            multiple={true}
            onChange={values => onChange(values)}
            style={style}
        />
    );
};

export default OptionSetSelect;
