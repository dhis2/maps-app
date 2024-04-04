import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Radio as UiRadio } from '@dhis2/ui';
import { RadioContext } from './RadioGroup';

const Radio = ({ value, disabled, dense = true, dataTest, label }) => {
    const { radio, onChange } = useContext(RadioContext);

    // onChange is from the parent component
    const onClick = () => {
        if (value !== radio) {
            onChange(value);
        }
    };

    return (
        <UiRadio
            label={label}
            dense={dense}
            disabled={disabled}
            checked={value === radio}
            onChange={onClick}
            dataTest={dataTest}
            value={value}
        />
    );
};

Radio.propTypes = {
    label: PropTypes.string.isRequired,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataTest: PropTypes.string,
};

export default Radio;
