import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { ColorPicker } from '../core';
import { setColorScale } from '../../actions/layerEdit';
import { THEMATIC_COLOR } from '../../constants/layers';

// Displays a color picker for single color layer
export const SingleColor = ({ color, setColorScale }) => {
    // Set default color
    useEffect(() => {
        if (!color || color.length !== 7) {
            setColorScale(THEMATIC_COLOR);
        }
    }, [color, setColorScale]);

    return color ? (
        <ColorPicker
            label={i18n.t('Color')}
            color={color}
            onChange={setColorScale}
            width={100}
            style={{
                marginTop: -5,
            }}
        />
    ) : null;
};

SingleColor.propTypes = {
    color: PropTypes.string,
    setColorScale: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        color: layerEdit.colorScale,
    }),
    { setColorScale }
)(SingleColor);
