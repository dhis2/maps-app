import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FieldGroup } from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/RadioGroup.module.css';

export const RadioContext = React.createContext();

const RadioGroup = ({
    value,
    label,
    helpText,
    display,
    onChange,
    children,
    dataTest,
}) => {
    const [radio, setRadio] = useState(value);

    useEffect(() => {
        if (value !== radio) {
            setRadio(value);
        }
    }, [value, radio]);

    return (
        <RadioContext.Provider value={{ radio, onChange }}>
            <div
                className={cx(styles.radioGroup, {
                    [styles.row]: display === 'row',
                })}
            >
                <FieldGroup
                    label={label}
                    helpText={helpText}
                    dataTest={dataTest}
                >
                    {children}
                </FieldGroup>
            </div>
        </RadioContext.Provider>
    );
};

RadioGroup.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    helpText: PropTypes.string,
    display: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
    dataTest: PropTypes.string,
};

export default RadioGroup;
