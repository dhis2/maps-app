import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Radio from '../core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

const styles = {
    radioGroup: {
        display: 'inline-block',
        marginTop: 8,
    },
    radio: {
        display: 'inline-block',
        paddingRight: 16,
        width: 'auto',
    },
};

const TotalsDetailsSelect = ({ operand, onChange, style }) => (
    <div style={style}>
        <RadioGroup
            name="operand"
            value={operand === true}
            onChange={(event, value) => onChange(value)}
            style={styles.radioGroup}
        >
            <Radio
                value={false}
                label={i18n.t('Totals')}
                // style={styles.radio}
            />
            <Radio
                value={true}
                label={i18n.t('Details')}
                // style={styles.radio}
            />
        </RadioGroup>
    </div>
);

TotalsDetailsSelect.propTypes = {
    operand: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default TotalsDetailsSelect;
