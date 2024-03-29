import { Radio as UiRadio } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import { RadioContext } from './RadioGroup.js'

const Radio = ({ value, disabled, dense = true, dataTest, label }) => {
    const { radio, onChange } = useContext(RadioContext)

    // onChange is from the parent component
    const onClick = () => {
        if (value !== radio) {
            onChange(value)
        }
    }

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
    )
}

Radio.propTypes = {
    label: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default Radio
