import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
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
import { countPeriods } from '../../util/periods.js'
import { CustomRadioLabel, Radio, RadioGroup } from '../core/index.js'
import {
    IconPeriodDisplaySingle,
    IconPeriodDisplaySplit,
    IconPeriodDisplayTimeline,
} from './icons.js'
import styles from './styles/RenderingStrategy.module.css'

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
        if (periods === prevPeriods) {
            return
        }

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
    }, [value, periods, prevPeriods, onChange, totalPeriods])

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
            [RENDERING_STRATEGY_SPLIT_BY_PERIOD]:
                totalPeriods < MULTIMAP_MIN_PERIODS
                    ? i18n.t(
                          'Select at least {{number}} periods or 1 multi-period.',
                          { number: MULTIMAP_MIN_PERIODS }
                      )
                    : hasTooManyPeriods
                    ? i18n.t(
                          'Only up to a total of {{number}} periods (including those in multi-periods) can be selected.',
                          { number: MULTIMAP_MAX_PERIODS }
                      )
                    : hasOtherLayers
                    ? i18n.t(
                          'Remove all existing layers to add a split map view.'
                      )
                    : undefined,
        }),
        [
            totalPeriods,
            hasOtherTimelineLayers,
            hasTooManyPeriods,
            hasOtherLayers,
        ]
    )

    const isDisabled = (strategy) => {
        switch (strategy) {
            case RENDERING_STRATEGY_TIMELINE:
                return (
                    totalPeriods < MULTIMAP_MIN_PERIODS ||
                    hasOtherTimelineLayers
                )
            case RENDERING_STRATEGY_SPLIT_BY_PERIOD:
                return (
                    totalPeriods < MULTIMAP_MIN_PERIODS ||
                    hasTooManyPeriods ||
                    hasOtherLayers
                )
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
    onChange: PropTypes.func.isRequired,
    layerId: PropTypes.string,
    periods: PropTypes.array,
    value: PropTypes.string,
}

export default RenderingStrategy
