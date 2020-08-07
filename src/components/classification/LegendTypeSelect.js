import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { RadioGroup } from '@material-ui/core';
import Radio from '../core/Radio';
import { setClassification } from '../../actions/layerEdit';
import { getLegendTypes } from '../../constants/layers';

const styles = {
    radioGroup: {
        paddingBottom: 16,
    },
};

// Select between user defined (automatic), predefined or single color
export const LegendTypeSelect = ({
    mapType,
    method,
    setClassification,
    classes,
}) =>
    method ? (
        <RadioGroup
            name="method"
            value={method}
            onChange={(event, method) => setClassification(Number(method))}
            className={classes.radioGroup}
        >
            {getLegendTypes(mapType === 'BUBBLE').map(({ id, name }) => (
                <Radio key={id} value={id} label={name} />
            ))}
        </RadioGroup>
    ) : null;

LegendTypeSelect.propTypes = {
    method: PropTypes.number,
    mapType: PropTypes.string,
    setClassification: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setClassification })(
    withStyles(styles)(LegendTypeSelect)
);
