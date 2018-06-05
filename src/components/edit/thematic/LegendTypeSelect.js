import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../../constants/layers';

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
            name="method"
            valueSelected={
                method === CLASSIFICATION_PREDEFINED
                    ? CLASSIFICATION_PREDEFINED
                    : CLASSIFICATION_EQUAL_INTERVALS
            }
            onChange={(event, type) => onChange(type)}
            style={styles.radioGroup}
        >
            <RadioButton
                value={CLASSIFICATION_EQUAL_INTERVALS}
                label={i18n.t('Automatic')}
                style={styles.radioButton}
            />
            <RadioButton
                value={CLASSIFICATION_PREDEFINED}
                label={i18n.t('Predefined')}
                style={styles.radioButton}
            />
        </RadioButtonGroup>
    </div>
);

export default LegendTypeSelect;
