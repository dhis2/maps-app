import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLegendSet } from '../../actions/layerEdit.js'
import { SelectField } from '../core/index.js'

// Load all legend sets
const LEGEND_SETS_QUERY = {
    sets: {
        resource: 'legendSets',
        params: {
            fields: ['id', 'displayName~rename(name)'],
            paging: false,
        },
    },
}

const style = {
    width: '100%',
}

const LegendSetSelect = ({ legendSetError }) => {
    const legendSet = useSelector((state) => state.layerEdit.legendSet)
    const dispatch = useDispatch()
    const { loading, error, data } = useDataQuery(LEGEND_SETS_QUERY)

    return (
        <SelectField
            label={i18n.t('Legend set')}
            loading={loading}
            items={data?.sets.legendSets}
            value={legendSet ? legendSet.id : null}
            errorText={error?.message || legendSetError}
            onChange={(legendSet) => dispatch(setLegendSet(legendSet))}
            style={style}
        />
    )
}

LegendSetSelect.propTypes = {
    legendSetError: PropTypes.string,
}

export default LegendSetSelect
