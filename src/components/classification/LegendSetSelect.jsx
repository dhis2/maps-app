import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLegendSet } from '../../actions/layerEdit.js'
import { SelectField } from '../core/index.js'
import styles from './styles/LegendSetSelect.module.css'

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

const LegendSetSelect = ({ defaultLegendSet, legendSetError }) => {
    const legendSet = useSelector((state) => state.layerEdit.legendSet)
    const dispatch = useDispatch()
    const { loading, error, data } = useDataQuery(LEGEND_SETS_QUERY)

    useEffect(() => {
        if (!legendSet && data?.sets.legendSets?.length) {
            const legendSets = data.sets.legendSets
            const defaultItem = defaultLegendSet
                ? legendSets.find((ls) => ls.id === defaultLegendSet.id) ??
                  legendSets[0]
                : legendSets[0]
            dispatch(setLegendSet(defaultItem))
        }
    }, [legendSet, data, defaultLegendSet, dispatch])

    return (
        <SelectField
            label={i18n.t('Legend set')}
            loading={loading}
            items={data?.sets.legendSets}
            value={legendSet ? legendSet.id : null}
            errorText={error?.message || legendSetError}
            onChange={(legendSet) => dispatch(setLegendSet(legendSet))}
            className={styles.legendSetSelect}
        />
    )
}

LegendSetSelect.propTypes = {
    defaultLegendSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    legendSetError: PropTypes.string,
}

export default LegendSetSelect
