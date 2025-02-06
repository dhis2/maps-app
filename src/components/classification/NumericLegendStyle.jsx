import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setClassification, setLegendSet } from '../../actions/layerEdit.js'
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_SINGLE_COLOR,
} from '../../constants/layers.js'
import Classification from './Classification.jsx'
import LegendSetSelect from './LegendSetSelect.jsx'
import LegendTypeSelect from './LegendTypeSelect.jsx'
import SingleColor from './SingleColor.jsx'

// Wrapper component for selecting legend style used for numeric map styles
const NumericLegendStyle = (props) => {
    const {
        mapType,
        method,
        dataItem,
        legendSet,
        setClassification,
        setLegendSet,
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
                    : CLASSIFICATION_EQUAL_INTERVALS
            )
        }
    }, [method, dataItem, setClassification])

    useEffect(() => {
        // Set legend set defined for data item in use by default
        if (isPredefined && !legendSet && dataItem?.legendSet) {
            setLegendSet(dataItem.legendSet)
        }
    }, [isPredefined, legendSet, dataItem, setLegendSet])

    return (
        <div style={style}>
            <LegendTypeSelect
                method={method}
                mapType={mapType}
                dataItem={dataItem}
            />
            {isSingleColor ? (
                <SingleColor />
            ) : isPredefined ? (
                <LegendSetSelect legendSetError={legendSetError} />
            ) : (
                <Classification />
            )}
        </div>
    )
}

NumericLegendStyle.propTypes = {
    setClassification: PropTypes.func.isRequired,
    setLegendSet: PropTypes.func.isRequired,
    dataItem: PropTypes.object,
    legendSet: PropTypes.object,
    legendSetError: PropTypes.string,
    mapType: PropTypes.string,
    method: PropTypes.number,
    style: PropTypes.object,
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        legendSet: layerEdit.legendSet,
    }),
    { setClassification, setLegendSet }
)(NumericLegendStyle)
