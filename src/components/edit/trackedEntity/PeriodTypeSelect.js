import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Radio from '../../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setThematicMapType } from '../../../actions/layerEdit';

const styles = {
    radioGroup: {
        paddingBottom: 20,
    },
    radio: {
        height: 36,
    },
};

export const PeriodTypeSelect = ({
    program,
    periodType = 'lastUpdated',
    // setThematicMapType,
    classes,
}) => {
    const label = i18n.t(
        'Select period when tracked entities were last updated'
    );

    return program ? (
        <RadioGroup
            name="type"
            value={periodType}
            // onChange={(event, type) => setThematicMapType(type)}
            onChange={() => {}}
            className={classes.radioGroup}
        >
            <Radio
                value="lastUpdated"
                label={label}
                className={classes.radio}
            />
            <Radio
                value="enrollment"
                label={i18n.t('Select program period')}
                className={classes.radio}
            />
        </RadioGroup>
    ) : (
        <div
            style={{
                margin: '12px 0',
                fontSize: 14,
            }}
        >
            {label}:
        </div>
    );
};

PeriodTypeSelect.propTypes = {
    periodType: PropTypes.string,
    program: PropTypes.object,
    // setThematicMapType: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setThematicMapType })(
    withStyles(styles)(PeriodTypeSelect)
);
