import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import NumberField from '../../core/NumberField';
import styles from './styles/NumberPrecision.module.css';

const NumberPrecision = ({ precision, onChange }) => {
    const [useOriginal, setUseOriginal] = useState(precision === undefined);

    return (
        <div className={styles.row}>
            <SelectField
                label={i18n.t('Number precision')}
                items={[
                    { id: 'original', name: i18n.t('Use original value') },
                    { id: 'custom', name: i18n.t('Custom value') },
                ]}
                value={useOriginal ? 'original' : 'custom'}
                onChange={({ id }) => {
                    setUseOriginal(id === 'original');
                    onChange(id === 'original' ? undefined : 0);
                }}
                className={styles.select}
                dense
            />
            <NumberField
                label={i18n.t('Decimals')}
                value={useOriginal ? undefined : precision}
                onChange={num => {
                    setUseOriginal(num === '');
                    onChange(num === '' ? undefined : Number(num));
                }}
                min={0}
                dense
            />
        </div>
    );
};

NumberPrecision.propTypes = {
    precision: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

export default NumberPrecision;
