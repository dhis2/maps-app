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
    singleMapPeriods,
    invalidSplitViewPeriods,
} from '../../constants/periods.js'
import usePrevious from '../../hooks/usePrevious.js'
import { Radio, RadioGroup } from '../core/index.js'

const RenderingStrategy = ({
    layerId,
    value = RENDERING_STRATEGY_SINGLE,
    period = {},
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
    const prevPeriod = usePrevious(period)

    useEffect(() => {
        if (period !== prevPeriod) {
            if (
                singleMapPeriods.includes(period.id) &&
                value !== RENDERING_STRATEGY_SINGLE
            ) {
                onChange(RENDERING_STRATEGY_SINGLE)
            } else if (
                invalidSplitViewPeriods.includes(period.id) &&
                value === RENDERING_STRATEGY_SPLIT_BY_PERIOD
            ) {
                // TODO: Switch to 'timeline' when we support it
                onChange(RENDERING_STRATEGY_SINGLE)
            }
        }
    }, [value, period, prevPeriod, onChange])

    if (singleMapPeriods.includes(period.id)) {
        return null
    }

    let helpText

    if (hasOtherTimelineLayers) {
        helpText = i18n.t('Only one timeline is allowed.')
    } else if (hasOtherLayers) {
        helpText = i18n.t('Remove other layers to enable split map views.')
    }

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
            <Radio value="SINGLE" label={i18n.t('Single (aggregate)')} />
            <Radio
                value="TIMELINE"
                label={i18n.t('Timeline')}
                disabled={hasOtherTimelineLayers}
            />
            <Radio
                value="SPLIT_BY_PERIOD"
                label={i18n.t('Split map views')}
                disabled={
                    hasOtherLayers ||
                    invalidSplitViewPeriods.includes(period.id)
                }
            />
        </RadioGroup>
    )
}

RenderingStrategy.propTypes = {
    onChange: PropTypes.func.isRequired,
    layerId: PropTypes.string,
    period: PropTypes.object,
    value: PropTypes.string,
}

export default RenderingStrategy
