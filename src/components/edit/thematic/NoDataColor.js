import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Checkbox, ColorPicker } from '../../core';
import { NO_DATA_COLOR } from '../../../constants/layers';
import styles from './styles/NoDataColor.module.css';

const NoDataColor = ({ value, onChange, className }) => {
    const onCheck = useCallback(
        val => onChange(val ? NO_DATA_COLOR : undefined),
        []
    );

    return (
        <div className={className}>
            <Checkbox
                label={i18n.t('Include org. units with no data')}
                checked={!!value}
                onChange={onCheck}
                className={styles.checkbox}
            />
            {value && (
                <ColorPicker
                    label={i18n.t('Color')}
                    color={value}
                    onChange={onChange}
                    width={50}
                    className={styles.colorPicker}
                />
            )}
        </div>
    );
};

NoDataColor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default NoDataColor;
