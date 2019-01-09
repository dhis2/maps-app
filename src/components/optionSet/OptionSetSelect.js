import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';

const OptionSetSelect = ({ options, value, onChange, style }) => {
    // TODO: Temporarily fix until we have a searchable SelectField handling hundreds of options
    if (options.length > 100) {
        options = options.slice(0, 100);
    }

    return (
        <SelectField
            label={i18n.t('Options')}
            items={options.map(option => ({
                id: option.code,
                name: option.name,
            }))}
            value={value}
            multiple={true}
            onChange={onChange}
            style={style}
        />
    );
};

OptionSetSelect.propTypes = {
    options: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default OptionSetSelect;
