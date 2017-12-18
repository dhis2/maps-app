import React from 'react';
import SelectField from 'd2-ui/lib/select-field/SelectField';

const OptionSetSelect = ({ options, value, onChange, style }) => {
    return (
        <SelectField
            label='Options' // TODO: i18n
            items={options.map(option => ({ id: option.code, name: option.name }))}
            value={value}
            multiple={true}
            onChange={values => onChange(values)}
            style={style}
        />
    );
};

export default OptionSetSelect;
