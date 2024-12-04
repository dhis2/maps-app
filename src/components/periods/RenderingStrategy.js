import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import { singleMapPeriods, MAX_PERIODS } from '../../constants/periods.js'
import { getPeriodsFromFilters } from '../../util/analytics.js'
import usePrevious from '../../hooks/usePrevious.js'
import { Radio, RadioGroup } from '../core/index.js'
import { getRelativePeriodsItemsCount } from '@dhis2/analytics'

const countPeriods = (periods) => {
    const itemsCount = getRelativePeriodsItemsCount()
    console.log('itemsCount', itemsCount)
    const total = periods.reduce(
        (sum, period) =>
            sum +
            (itemsCount[period.id] !== undefined ? itemsCount[period.id] : 1),
        0
    )
    console.log('total', total)
    return total
}

const RenderingStrategy = ({
    layerId,
    value = RENDERING_STRATEGY_SINGLE,
    periods = [],
    onChange,
}) => {
    const hasOtherLayers = useSelector(
        ({ map }) => !!map.mapViews.filter(({ id }) => id !== layerId).length
    )
    const hasOtherTimelineLayers = useSelector(
        ({ map }) =>
            !!map.mapViews.find(
                (layer) =>
                    layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE &&
                    layer.id !== layerId
            )
    )
    const hasTooManyPeriods = useSelector(({ layerEdit }) => {
        console.log('layerEdit', layerEdit)
        const periods = getPeriodsFromFilters(layerEdit.filters)
        console.log('periods', periods)
        return countPeriods(periods) > MAX_PERIODS
    })

    const prevPeriods = usePrevious(periods)

    useEffect(() => {
        if (periods !== prevPeriods) {
            if (
                periods.length === 1 &&
                singleMapPeriods.includes(periods[0].id) &&
                value !== RENDERING_STRATEGY_SINGLE
            ) {
                onChange(RENDERING_STRATEGY_SINGLE)
            } else if (
                countPeriods(periods) > MAX_PERIODS &&
                (value === RENDERING_STRATEGY_TIMELINE ||
                    value === RENDERING_STRATEGY_SPLIT_BY_PERIOD)
            ) {
                onChange(RENDERING_STRATEGY_SINGLE)
            }
        }
    }, [value, periods, prevPeriods, onChange])

    if (periods.length === 1 && singleMapPeriods.includes(periods[0].id)) {
        return null
    }

    let helpText = []

    if (hasOtherTimelineLayers) {
        helpText.push(i18n.t('Only one timeline is allowed.'))
    }
    if (hasOtherLayers) {
        helpText.push(i18n.t('Remove other layers to enable split map views.'))
    }
    if (hasTooManyPeriods) {
        helpText.push(
            i18n.t('Only up to ') +
                MAX_PERIODS +
                i18n.t(
                    ' periods can be selected to enable timeline or split map views.'
                )
        )
    }
    helpText = helpText.join(' ')

    return (
        <RadioGroup
            label={i18n.t('Period display mode')}
            value={value}
            onChange={onChange}
            helpText={helpText}
            display={'row'}
            boldLabel={true}
            compact={true}
        >
            <Radio value="SINGLE" label={i18n.t('Single (combine periods)')} />
            <Radio
                value="TIMELINE"
                label={i18n.t('Timeline')}
                disabled={hasTooManyPeriods || hasOtherTimelineLayers}
            />
            <Radio
                value="SPLIT_BY_PERIOD"
                label={i18n.t('Split map views')}
                disabled={hasTooManyPeriods || hasOtherLayers}
            />
        </RadioGroup>
    )
}

RenderingStrategy.propTypes = {
    onChange: PropTypes.func.isRequired,
    layerId: PropTypes.string,
    periods: PropTypes.array,
    value: PropTypes.string,
}

export default RenderingStrategy
