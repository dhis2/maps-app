import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setClassification } from '../../actions/layerEdit.js'
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_AUTO_DEFAULT,
    CLASSIFICATION_SINGLE_COLOR,
} from '../../constants/layers.js'
import Classification from './Classification.jsx'
import IsolatedClass from './IsolatedClass.jsx'
import LegendSetSelect from './LegendSetSelect.jsx'
import LegendTypeSelect from './LegendTypeSelect.jsx'
import SingleColor from './SingleColor.jsx'

// Wrapper component for selecting legend style used for numeric map styles
const NumericLegendStyle = (props) => {
    const {
        mapType,
        method,
        dataItem,
        setClassification,
        legendSetError,
        style,
    } = props

    const isSingleColor = method === CLASSIFICATION_SINGLE_COLOR
    const isPredefined = method === CLASSIFICATION_PREDEFINED

    useEffect(() => {
        // Set default classification method
        if (!method) {
            // Use predefined legend if defined for data item
            setClassification(
                dataItem && dataItem.legendSet
                    ? CLASSIFICATION_PREDEFINED
                    : CLASSIFICATION_AUTO_DEFAULT
            )
        }
    }, [method, dataItem, setClassification])

    return (
        <div style={style}>
            <LegendTypeSelect
                method={method}
                mapType={mapType}
                dataItem={dataItem}
            />
            {isSingleColor ? (
                <>
                    <SingleColor />
                    <IsolatedClass />
                </>
            ) : isPredefined ? (
                <LegendSetSelect
                    legendSetError={legendSetError}
                    defaultLegendSet={dataItem?.legendSet}
                />
            ) : (
                <Classification />
            )}
        </div>
    )
}

NumericLegendStyle.propTypes = {
    setClassification: PropTypes.func.isRequired,
    dataItem: PropTypes.object,
    legendSetError: PropTypes.string,
    mapType: PropTypes.string,
    method: PropTypes.number,
    style: PropTypes.object,
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
    }),
    { setClassification }
)(NumericLegendStyle)
