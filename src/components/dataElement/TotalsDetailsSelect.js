import React, { Component } from 'react';
import i18next from 'i18next';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

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

const TotalsDetailsSelect = ({ operand, onChange, style }) => (
    <div style={style}>
        <RadioButtonGroup
            name="operand"
            valueSelected={operand === true}
            onChange={(event, value) => onChange(value)}
            style={styles.radioGroup}
        >
            <RadioButton
                value={false}
                label={i18next.t('Totals')}
                style={styles.radioButton}
            />
            <RadioButton
                value={true}
                label={i18next.t('Details')}
                style={styles.radioButton}
            />
        </RadioButtonGroup>
    </div>
);

export default TotalsDetailsSelect;
