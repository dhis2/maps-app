import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles/DatePicker.module.css';

// Fallback on browser native until full DatePicker support in @dhis2/ui
const DatePicker = ({ label, name, defaultVal, onBlur, className }) => {
    const inputEl = useRef(null);

    useEffect(() => {
        if (inputEl.current) {
            inputEl.current.defaultValue = defaultVal;
        }
    }, [defaultVal]);

    return (
        <div className={cx(styles.datePicker, className)}>
            <label className={styles.label}>{label}</label>
            <div className={styles.content}>
                <div className={styles.box}>
                    <div className={styles.inputDiv}>
                        <input
                            className={styles.input}
                            ref={inputEl}
                            type="date"
                            name={name}
                            onBlur={e => onBlur(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    defaultVal: PropTypes.string,
    dense: PropTypes.bool,
    name: PropTypes.string,
    onBlur: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default DatePicker;
