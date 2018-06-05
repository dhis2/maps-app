import React, { Component } from 'react';
import i18n from '@dhis2/d2-i18n';
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
                label={i18n.t('Totals')}
                style={styles.radioButton}
            />
            <RadioButton
                value={true}
                label={i18n.t('Details')}
                style={styles.radioButton}
            />
        </RadioButtonGroup>
    </div>
);

export default TotalsDetailsSelect;
