import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RadioGroup from '../../core/RadioGroup';
import Radio from '../../core/Radio';
import { setThematicMapType } from '../../../actions/layerEdit';
import {
    THEMATIC_CHOROPLETH,
    getThematicMapTypes,
} from '../../../constants/layers';

// Select between choropleth and bubble map for thematic layers
export const ThematicMapTypeSelect = ({
    type = THEMATIC_CHOROPLETH,
    setThematicMapType,
}) => (
    <RadioGroup name="type" value={type} onChange={setThematicMapType}>
        {getThematicMapTypes().map(({ id, name }) => (
            <Radio key={id} value={id} label={name} />
        ))}
    </RadioGroup>
);

ThematicMapTypeSelect.propTypes = {
    type: PropTypes.string,
    setThematicMapType: PropTypes.func.isRequired,
};

export default connect(null, { setThematicMapType })(ThematicMapTypeSelect);
