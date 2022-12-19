import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setColorScale } from '../../actions/layerEdit.js'
import { THEMATIC_COLOR } from '../../constants/layers.js'
import { ColorPicker } from '../core/index.js'

// Displays a color picker for single color layer
const SingleColor = ({ color, setColorScale }) => {
    // Set default color
    useEffect(() => {
        if (!color || color.length !== 7) {
            setColorScale(THEMATIC_COLOR)
        }
    }, [color, setColorScale])

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
    ) : null
}

SingleColor.propTypes = {
    setColorScale: PropTypes.func.isRequired,
    color: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        color: layerEdit.colorScale,
    }),
    { setColorScale }
)(SingleColor)
