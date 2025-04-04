import PropTypes from 'prop-types'
import React from 'react'
import {
    numberValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes.js'
import NumericLegendStyle from '../classification/NumericLegendStyle.js'
import OptionSetStyle from '../optionSet/OptionSetStyle.js'
import BooleanStyle from './BooleanStyle.js'

const DataItemStyle = ({ dataItem, style }) => {
    if (!dataItem) {
        return null
    }

    const { valueType, optionSet } = dataItem

    return (
        <div style={style}>
            {!optionSet && numberValueTypes.includes(valueType) ? (
                <NumericLegendStyle
                    dataItem={dataItem}
                    style={{ width: '100%' }}
                />
            ) : null}

            {!optionSet && booleanValueTypes.includes(valueType) ? (
                <BooleanStyle {...dataItem} />
            ) : null}

            {optionSet ? <OptionSetStyle styledOptionSet={optionSet} /> : null}
        </div>
    )
}

DataItemStyle.propTypes = {
    dataItem: PropTypes.object,
    style: PropTypes.object,
}

export default DataItemStyle
