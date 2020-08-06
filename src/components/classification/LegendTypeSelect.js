import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setClassification, setColorScale } from '../../actions/layerEdit';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    THEMATIC_COLOR,
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
export const LegendTypeSelect = ({
    mapType,
    method,
    isSingleColor,
    setClassification,
    setColorScale,
    classes,
}) => {
    const isBubble = mapType === 'BUBBLE';

    const value = String(
        method === CLASSIFICATION_PREDEFINED
            ? CLASSIFICATION_PREDEFINED
            : CLASSIFICATION_EQUAL_INTERVALS
    );

    const onChange = useCallback(
        (event, method) =>
            method === 'single'
                ? setColorScale(THEMATIC_COLOR)
                : setClassification(Number(method)),
        [setClassification, setColorScale]
    );

    return (
        <RadioGroup
            name="method"
            value={isSingleColor ? 'single' : value}
            onChange={onChange}
            className={classes.radioGroup}
        >
            {isBubble && (
                <Radio
                    value={'single'}
                    label={i18n.t('Single color')}
                    className={classes.radio}
                />
            )}
            <Radio
                value={String(CLASSIFICATION_EQUAL_INTERVALS)}
                label={i18n.t('Automatic classes')}
                className={classes.radio}
            />
            <Radio
                value={String(CLASSIFICATION_PREDEFINED)}
                label={i18n.t('Predefined classes')}
                className={classes.radio}
            />
        </RadioGroup>
    );
};

LegendTypeSelect.propTypes = {
    method: PropTypes.number,
    mapType: PropTypes.string,
    isSingleColor: PropTypes.bool,
    setClassification: PropTypes.func.isRequired,
    setColorScale: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setClassification, setColorScale })(
    withStyles(styles)(LegendTypeSelect)
);
