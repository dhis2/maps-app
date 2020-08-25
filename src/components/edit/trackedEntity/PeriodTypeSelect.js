import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Radio from '../../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setPeriodType } from '../../../actions/layerEdit';

const styles = {
    radioGroup: {
        paddingBottom: 20,
    },
    radio: {
        height: 36,
    },
    label: {
        margin: '12px 0',
        fontSize: 14,
    },
};

export const PeriodTypeSelect = ({
    program,
    periodType = 'lastUpdated',
    setPeriodType,
    classes,
}) => {
    const label = i18n.t(
        'Select period when tracked entities were last updated'
    );

    return program ? (
        <RadioGroup
            name="type"
            value={periodType}
            onChange={(event, type) => setPeriodType({ id: type })}
            className={classes.radioGroup}
        >
            <Radio
                value="lastUpdated"
                label={label}
                className={classes.radio}
            />
            <Radio
                value="program"
                label={i18n.t('Select program period')}
                className={classes.radio}
            />
        </RadioGroup>
    ) : (
        <div className={classes.label}>{label}:</div>
    );
};

PeriodTypeSelect.propTypes = {
    periodType: PropTypes.string,
    program: PropTypes.object,
    setPeriodType: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        program: layerEdit.program,
        periodType: layerEdit.periodType,
    }),
    { setPeriodType }
)(withStyles(styles)(PeriodTypeSelect));
