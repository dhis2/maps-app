import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setAggregationType } from '../../../actions/layerEdit.js'
import { getThematicAggregationTypes } from '../../../constants/aggregationTypes.js'
import { SelectField } from '../../core/index.js'

const AggregationTypeSelect = ({
    aggregationType,
    setAggregationType,
    className,
}) => {
    const types = getThematicAggregationTypes()

    return (
        <SelectField
            label={i18n.t('Aggregation type')}
            items={getThematicAggregationTypes()}
            value={aggregationType || types[0].id}
            onChange={(type) => setAggregationType(type.id)}
            className={className}
        />
    )
}

AggregationTypeSelect.propTypes = {
    setAggregationType: PropTypes.func.isRequired,
    aggregationType: PropTypes.string,
    className: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypeSelect)
