import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
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
import { countPeriods } from '../../util/periods.js'
import { CustomRadioLabel, Radio, RadioGroup } from '../core/index.js'
import {
    IconPeriodDisplaySingle,
    IconPeriodDisplaySplit,
    IconPeriodDisplayTimeline,
} from './icons.jsx'
import styles from './styles/RenderingStrategy.module.css'

const RenderingStrategy = ({
    layerId,
    value = RENDERING_STRATEGY_SINGLE,
    periods,
    onChange,
}) => {
    const totalPeriods = useMemo(() => countPeriods(periods), [periods])

    const hasOtherTimelineLayers = useSelector(({ map }) =>
        map.mapViews.some(
            (layer) =>
                layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE &&
                layer.id !== layerId
        )
    )
    const hasOtherSplitLayers = useSelector(({ map }) =>
        map.mapViews.some(
            (layer) =>
                layer.renderingStrategy ===
                    RENDERING_STRATEGY_SPLIT_BY_PERIOD && layer.id !== layerId
        )
    )
    const hasOtherNonSplitLayers = useSelector(({ map }) =>
        map.mapViews.some(
            (layer) =>
                layer.renderingStrategy !==
                    RENDERING_STRATEGY_SPLIT_BY_PERIOD && layer.id !== layerId
        )
    )

    const getHelpText = useMemo(
        () => ({
            [RENDERING_STRATEGY_SINGLE]: undefined,
            [RENDERING_STRATEGY_TIMELINE]:
                totalPeriods < MULTIMAP_MIN_PERIODS
                    ? i18n.t(
                          'Select at least {{number}} periods or 1 multi-period.',
                          { number: MULTIMAP_MIN_PERIODS }
                      )
                    : hasOtherTimelineLayers
                    ? i18n.t('Remove the existing timeline to add a new one.')
                    : undefined,
            [RENDERING_STRATEGY_SPLIT_BY_PERIOD]: hasOtherNonSplitLayers
                ? i18n.t('Remove all other layers to add a split view.')
                : totalPeriods > MULTIMAP_MAX_PERIODS
                ? i18n.t(
                      'Only up to a total of {{number}} periods (including those in multi-periods) can be selected.',
                      { number: MULTIMAP_MAX_PERIODS }
                  )
                : undefined,
        }),
        [totalPeriods, hasOtherTimelineLayers, hasOtherNonSplitLayers]
    )

    const isDisabled = (strategy) => {
        switch (strategy) {
            case RENDERING_STRATEGY_SINGLE:
                return hasOtherSplitLayers
            case RENDERING_STRATEGY_TIMELINE:
                return hasOtherSplitLayers
            case RENDERING_STRATEGY_SPLIT_BY_PERIOD:
                return hasOtherNonSplitLayers
            default:
                return false
        }
    }

    const strategies = [
        {
            value: RENDERING_STRATEGY_SINGLE,
            icon: <IconPeriodDisplaySingle />,
            label: i18n.t('Single'),
            sublabel: i18n.t(
                'Show periods as a combined layer. Data is aggregated.'
            ),
        },
        {
            value: RENDERING_STRATEGY_TIMELINE,
            icon: <IconPeriodDisplayTimeline />,
            label: i18n.t('Timeline'),
            sublabel: i18n.t(
                'Show multiple periods as an interactive timeline.'
            ),
        },
        {
            value: RENDERING_STRATEGY_SPLIT_BY_PERIOD,
            icon: <IconPeriodDisplaySplit />,
            label: i18n.t('Split'),
            sublabel: i18n.t(
                'Show multiple maps in view, one for each period (max {{number}}).',
                { number: MULTIMAP_MAX_PERIODS }
            ),
        },
    ]

    return (
        <div className={styles.renderingStrategy}>
            <RadioGroup
                label={i18n.t('Period display mode')}
                value={value}
                onChange={onChange}
                boldLabel={true}
                display="row"
            >
                {strategies.map(
                    ({ value: strategy, icon, label, sublabel }) => {
                        const content = (
                            <Radio
                                value={strategy}
                                label={
                                    <CustomRadioLabel
                                        icon={icon}
                                        label={label}
                                        sublabel={sublabel}
                                        checked={value === strategy}
                                        disabled={isDisabled(strategy)}
                                    />
                                }
                                disabled={isDisabled(strategy)}
                            />
                        )
                        const tooltip = getHelpText[strategy]
                        return (
                            <div key={strategy}>
                                {tooltip ? (
                                    <Tooltip content={tooltip} placement="top">
                                        {content}
                                    </Tooltip>
                                ) : (
                                    content
                                )}
                            </div>
                        )
                    }
                )}
            </RadioGroup>
        </div>
    )
}

RenderingStrategy.propTypes = {
    periods: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    layerId: PropTypes.string,
    value: PropTypes.string,
}

export default RenderingStrategy
