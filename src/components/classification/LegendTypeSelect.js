import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setClassification } from '../../actions/layerEdit';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../constants/layers';

const styles = {
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
    radio: {
        flex: 1,
    },
};

// Select between user defined (automatic) and predefined legends
// MUI RadioGroup/Radio only accepts strings as value
export const LegendTypeSelect = ({ method, setClassification, classes }) => (
    <RadioGroup
        name="method"
        value={String(
            method === CLASSIFICATION_PREDEFINED
                ? CLASSIFICATION_PREDEFINED
                : CLASSIFICATION_EQUAL_INTERVALS
        )}
        onChange={(event, method) => setClassification(Number(method))}
        className={classes.radioGroup}
    >
        <Radio
            value={String(CLASSIFICATION_EQUAL_INTERVALS)}
            label={i18n.t('Automatic')}
            className={classes.radio}
        />
        <Radio
            value={String(CLASSIFICATION_PREDEFINED)}
            label={i18n.t('Predefined')}
            className={classes.radio}
        />
    </RadioGroup>
);

LegendTypeSelect.propTypes = {
    method: PropTypes.number,
    setClassification: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setClassification })(
    withStyles(styles)(LegendTypeSelect)
);
