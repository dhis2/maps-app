import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo } from 'react'
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
import usePrevious from '../../hooks/usePrevious.js'
import { getPeriodsFromFilters } from '../../util/analytics.js'
import { Radio, RadioGroup } from '../core/index.js'
import { countPeriods } from '../../util/periods.js'

const RenderingStrategy = ({
    layerId,
    value = RENDERING_STRATEGY_SINGLE,
    periods = [],
    onChange,
}) => {
    const prevPeriods = usePrevious(periods)
    const totalPeriods = useMemo(() => countPeriods(periods), [periods])

    const hasOtherLayers = useSelector(({ map }) =>
        map.mapViews.some(({ id }) => id !== layerId)
    )
    const hasOtherTimelineLayers = useSelector(({ map }) =>
        map.mapViews.some(
            (layer) =>
                layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE &&
                layer.id !== layerId
        )
    )
    const hasTooManyPeriods = useSelector(({ layerEdit }) => {
        const periods = getPeriodsFromFilters(layerEdit.filters)
        return countPeriods(periods) > MULTIMAP_MAX_PERIODS
    })

    useEffect(() => {
        if (periods === prevPeriods) return

        if (
            totalPeriods < MULTIMAP_MIN_PERIODS &&
            value !== RENDERING_STRATEGY_SINGLE
        ) {
            onChange(RENDERING_STRATEGY_SINGLE)
        } else if (
            totalPeriods > MULTIMAP_MAX_PERIODS &&
            value === RENDERING_STRATEGY_SPLIT_BY_PERIOD
        ) {
            onChange(RENDERING_STRATEGY_SINGLE)
        }
    }, [value, periods, prevPeriods, onChange])

    const helpText = useMemo(() => {
        const messages = []
        if (totalPeriods < MULTIMAP_MIN_PERIODS) {
            messages.push(
                i18n.t(
                    'Select {{number}} or more periods to enable timeline or split map views.',
                    {
                        number: MULTIMAP_MIN_PERIODS,
                    }
                )
            )
        }
        if (hasOtherTimelineLayers) {
            messages.push(i18n.t('Only one timeline is allowed.'))
        }
        if (hasOtherLayers) {
            messages.push(
                i18n.t('Remove other layers to enable split map views.')
            )
        }
        if (hasTooManyPeriods) {
            messages.push(
                i18n.t(
                    'Only up to {{number}} periods can be selected to enable split map views.',
                    {
                        number: MULTIMAP_MAX_PERIODS,
                    }
                )
            )
        }
        return messages.join(' ')
    }, [
        totalPeriods,
        hasOtherTimelineLayers,
        hasOtherLayers,
        hasTooManyPeriods,
    ])

    const isTimelineDisabled = useMemo(
        () => totalPeriods < MULTIMAP_MIN_PERIODS || hasOtherTimelineLayers,
        [totalPeriods, hasOtherTimelineLayers]
    )

    const isSplitViewDisabled = useMemo(
        () =>
            totalPeriods < MULTIMAP_MIN_PERIODS ||
            hasTooManyPeriods ||
            hasOtherLayers,
        [totalPeriods, hasTooManyPeriods, hasOtherLayers]
    )

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
            <Radio
                value={RENDERING_STRATEGY_SINGLE}
                label={i18n.t('Single (combine periods)')}
            />
            <Radio
                value={RENDERING_STRATEGY_TIMELINE}
                label={i18n.t('Timeline')}
                disabled={isTimelineDisabled}
            />
            <Radio
                value={RENDERING_STRATEGY_SPLIT_BY_PERIOD}
                label={i18n.t('Split map views')}
                disabled={isSplitViewDisabled}
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
