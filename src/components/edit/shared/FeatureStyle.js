import React from 'react';
import PropTypes from 'prop-types';
import { ColorPicker, NumberField } from '../../core';
import styles from '../styles/LayerDialog.module.css';

const FeatureStyle = ({ fields = [], style = {}, onChange }) => {
    return (
        <>
            {fields.map(({ id, label, type }) =>
                type === 'color' ? (
                    <ColorPicker
                        key={id}
                        label={label}
                        color={style[id]}
                        onChange={color => onChange({ [id]: color })}
                        className={styles.narrowField}
                    />
                ) : (
                    <NumberField
                        key={id}
                        label={label}
                        value={style[id]}
                        onChange={value => onChange({ [id]: value })}
                        className={styles.narrowField}
                    />
                )
            )}
        </>
    );
};

FeatureStyle.propTypes = {
    fields: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
};

export default FeatureStyle;
