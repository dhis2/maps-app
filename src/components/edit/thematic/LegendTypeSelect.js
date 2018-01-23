import React from 'react';
import i18next from 'i18next';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { PREDEFINED, EQUAL_INTERVALS } from '../../../constants/layers';

const styles = {
    radioGroup: {
        display: 'inline-block',
        marginTop: 8,
    },
    radioButton: {
        display: 'inline-block',
        paddingRight: 16,
        width: 'auto',
    },
};

export const LegendTypeSelect = ({ method, onChange, style }) => (
    <div style={style}>
        <RadioButtonGroup
            name='method'
            valueSelected={method === PREDEFINED ? PREDEFINED : EQUAL_INTERVALS}
            onChange={(event, type) => onChange(type)}
            style={styles.radioGroup}
        >
            <RadioButton
                value={EQUAL_INTERVALS }
                label={i18next.t('Automatic')}
                style={styles.radioButton}
            />
            <RadioButton
                value={PREDEFINED}
                label={i18next.t('Predefined')}
                style={styles.radioButton}
            />
        </RadioButtonGroup>
    </div>
);


export default LegendTypeSelect;
