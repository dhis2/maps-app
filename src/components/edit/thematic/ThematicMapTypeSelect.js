import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setThematicMapType } from '../../../actions/layerEdit';
import {
    THEMATIC_CHOROPLETH,
    getThematicMapTypes,
} from '../../../constants/layers';

const styles = {
    radioGroup: {
        paddingBottom: 20,
    },
};

// Select between choropleth and bubble map for thematic layers
export const ThematicMapTypeSelect = ({
    type = THEMATIC_CHOROPLETH,
    setThematicMapType,
    classes,
}) => (
    <RadioGroup
        name="type"
        value={type}
        onChange={(event, type) => setThematicMapType(type)}
        className={classes.radioGroup}
    >
        {getThematicMapTypes().map(({ id, name }) => (
            <Radio key={id} value={id} label={name} />
        ))}
    </RadioGroup>
);

ThematicMapTypeSelect.propTypes = {
    type: PropTypes.string,
    setThematicMapType: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setThematicMapType })(
    withStyles(styles)(ThematicMapTypeSelect)
);
