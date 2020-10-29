import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Radio as UiRadio } from '@dhis2/ui';
import { RadioContext } from './RadioGroup';

const Radio = ({ value, dataTest, label }) => {
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
            checked={value === radio}
            onChange={onClick}
            dataTest={dataTest}
        />
    );
};

Radio.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataTest: PropTypes.string,
};

export default Radio;
