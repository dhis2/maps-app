import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setClassification } from '../../actions/layerEdit.js'
import {
    getLegendTypes,
    getClassificationTypes,
    CLASSIFICATION_AUTO_DEFAULT,
} from '../../constants/layers.js'
import { Radio, RadioGroup } from '../core/index.js'

// Select between user defined (automatic), predefined or single color
const LegendTypeSelect = ({ mapType, method, setClassification }) =>
    method ? (
        <RadioGroup
            value={String(
                getClassificationTypes()
                    .map(({ id }) => id)
                    .includes(method)
                    ? CLASSIFICATION_AUTO_DEFAULT
                    : method
            )}
            onChange={(method) => setClassification(Number(method))}
        >
            {getLegendTypes(mapType === 'BUBBLE').map(({ id, name }) => (
                <Radio key={id} value={String(id)} label={name} />
            ))}
        </RadioGroup>
    ) : null

LegendTypeSelect.propTypes = {
    setClassification: PropTypes.func.isRequired,
    mapType: PropTypes.string,
    method: PropTypes.number,
}

export default connect(null, { setClassification })(LegendTypeSelect)
