import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setAggregationType } from '../../../actions/layerEdit.js'
import {
    getEarthEngineAggregationTypes,
    getEarthEngineStatisticTypes,
} from '../../../constants/aggregationTypes.js'
import { hasClasses } from '../../../util/earthEngine.js'
import { SelectField } from '../../core/index.js'

const AggregationSelect = ({
    aggregations,
    defaultAggregations,
    aggregationType,
    setAggregationType,
}) => {
    const classes = hasClasses(defaultAggregations)

    const types = classes
        ? getEarthEngineStatisticTypes()
        : getEarthEngineAggregationTypes(aggregations)

    useEffect(() => {
        if (!aggregationType && defaultAggregations) {
            setAggregationType(defaultAggregations)
        }
    }, [aggregationType, defaultAggregations, setAggregationType])

    return (
        <SelectField
            label={i18n.t('Aggregation method')}
            items={types}
            multiple={!classes}
            value={aggregationType}
            onChange={(type) => setAggregationType(classes ? type.id : type)}
        />
    )
}

AggregationSelect.propTypes = {
    setAggregationType: PropTypes.func.isRequired,
    aggregationType: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    aggregations: PropTypes.array,
    defaultAggregations: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
}

export default connect(
    ({ layerEdit }) => ({
        aggregations: layerEdit.aggregations,
        defaultAggregations: layerEdit.defaultAggregations,
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationSelect)
