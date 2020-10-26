import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../core/Radio';
import { RadioGroup } from '@material-ui/core';

const styles = {
    radioGroup: {
        display: 'inline-block',
        marginTop: 8,
    },
};

const TotalsDetailsSelect = ({ operand, onChange, className, classes }) => (
    <div style={className}>
        <RadioGroup
            name="operand"
            value={operand === true ? 'details' : 'totals'}
            onChange={(event, value) => onChange(value === 'details')}
            className={classes.radioGroup}
        >
            <Radio value="totals" label={i18n.t('Totals')} />
            <Radio value="details" label={i18n.t('Details')} />
        </RadioGroup>
    </div>
);

TotalsDetailsSelect.propTypes = {
    operand: PropTypes.bool, // true = 'details'
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TotalsDetailsSelect);
