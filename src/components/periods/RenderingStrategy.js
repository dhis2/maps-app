import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import {
    MULTIMAP_MIN_PERIODS,
    MULTIMAP_MAX_PERIODS,
} from '../../constants/periods.js'
import { getPeriodsFromFilters } from '../../util/analytics.js'
import usePrevious from '../../hooks/usePrevious.js'
import { Radio, RadioGroup } from '../core/index.js'
import { getRelativePeriodsDetails } from '@dhis2/analytics'

const countPeriods = (periods) => {
    const periodsDetails = getRelativePeriodsDetails()
    console.log('periodsDetails', periodsDetails)

    const total_v1 = periods.reduce(
        (sum, period) =>
            sum +
            (periodsDetails[period.id] !== undefined
                ? periodsDetails[period.id].duration
                : 1),
        0
    )

    const durationByType = periods.reduce((acc, period) => {
        console.log('🚀 ~ test ~ period:', period)
        const periodDetails = periodsDetails[period.id]
        if (acc['FIXED_PERIOD'] === undefined) {
            acc['FIXED_PERIOD'] = {
                any: 0,
            }
        }
        if (periodDetails === undefined) {
            acc['FIXED_PERIOD'].any += 1
            return acc
        }
        const type = periodDetails.type
        if (acc[type] === undefined) {
            acc[type] = {
                first: 0,
                last: 0,
            }
        }
        acc[type].first = Math.max(acc[type].first, 1 + periodDetails.offset)
        acc[type].last = Math.max(
            acc[type].last,
            periodDetails.duration - (1 + periodDetails.offset)
        )
        return acc
    }, {})

    const sumObjectValues = (obj) =>
        Object.values(obj).reduce((sum, value) => {
            if (typeof value === 'object') {
                return sum + sumObjectValues(value)
            } else if (typeof value === 'number') {
                return sum + value
            }
            return sum
        }, 0)

    const total_v2 = sumObjectValues(durationByType)

    console.log('total_v1', total_v1)
    console.log('total_v2', total_v2)
    return total_v2
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
        return countPeriods(periods) > MULTIMAP_MAX_PERIODS
    })

    const prevPeriods = usePrevious(periods)

    useEffect(() => {
        if (periods !== prevPeriods) {
            if (
                countPeriods(periods) < MULTIMAP_MIN_PERIODS &&
                value !== RENDERING_STRATEGY_SINGLE
            ) {
                onChange(RENDERING_STRATEGY_SINGLE)
            } else if (
                countPeriods(periods) > MULTIMAP_MAX_PERIODS &&
                value === RENDERING_STRATEGY_SPLIT_BY_PERIOD
            ) {
                onChange(RENDERING_STRATEGY_SINGLE)
            }
        }
    }, [value, periods, prevPeriods, onChange])

    let helpText = []

    if (countPeriods(periods) < MULTIMAP_MIN_PERIODS) {
        helpText.push(
            i18n.t('Select ') +
                MULTIMAP_MIN_PERIODS +
                i18n.t(
                    ' or more periods to enable timeline or split map views.'
                )
        )
    }
    if (hasOtherTimelineLayers) {
        helpText.push(i18n.t('Only one timeline is allowed.'))
    }
    if (hasOtherLayers) {
        helpText.push(i18n.t('Remove other layers to enable split map views.'))
    }
    if (hasTooManyPeriods) {
        helpText.push(
            i18n.t('Only up to ') +
                MULTIMAP_MAX_PERIODS +
                i18n.t(' periods can be selected to enable split map views.')
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
                disabled={
                    countPeriods(periods) < MULTIMAP_MIN_PERIODS ||
                    hasOtherTimelineLayers
                }
            />
            <Radio
                value="SPLIT_BY_PERIOD"
                label={i18n.t('Split map views')}
                disabled={
                    countPeriods(periods) < MULTIMAP_MIN_PERIODS ||
                    hasTooManyPeriods ||
                    hasOtherLayers
                }
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
