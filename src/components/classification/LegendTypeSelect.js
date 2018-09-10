import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
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
    }
};

// Select between user defined (automatic) and predefined legends
export const LegendTypeSelect = ({ method, setClassification, classes}) => (
    <RadioGroup
        name="method"
        value={
            method == CLASSIFICATION_PREDEFINED
                ? CLASSIFICATION_PREDEFINED
                : CLASSIFICATION_EQUAL_INTERVALS
        }
        onChange={(event, method) => setClassification(Number(method))}
        className={classes.radioGroup}
        // style={{ ...styles.flexInnerColumnFlow, marginTop: 8 }}
    >
        <Radio 
            value={CLASSIFICATION_EQUAL_INTERVALS} 
            control={<Radio />} 
            label={i18n.t('Automatic')} 
            className={classes.radio}
        />        
        <Radio 
            value={CLASSIFICATION_PREDEFINED} 
            control={<Radio />} 
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

export default connect(
    null,
    { setClassification }
)(withStyles(styles)(LegendTypeSelect));
