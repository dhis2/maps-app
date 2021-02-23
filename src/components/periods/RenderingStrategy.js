import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Radio, RadioGroup } from '../core';
import i18n from '@dhis2/d2-i18n';
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers';
import {
    singleMapPeriods,
    invalidSplitViewPeriods,
} from '../../constants/periods';

class RenderingStrategy extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        layerId: PropTypes.string,
        hasOtherLayers: PropTypes.bool,
        hasOtherTimelineLayers: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        value: RENDERING_STRATEGY_SINGLE,
        period: {},
    };

    componentDidUpdate(prevProps) {
        const { value, period, onChange } = this.props;

        if (period !== prevProps.period) {
            if (
                singleMapPeriods.includes(period.id) &&
                value !== RENDERING_STRATEGY_SINGLE
            ) {
                onChange(RENDERING_STRATEGY_SINGLE);
            } else if (
                invalidSplitViewPeriods.includes(period.id) &&
                value === RENDERING_STRATEGY_SPLIT_BY_PERIOD
            ) {
                // TODO: Switch to 'timeline' when we support it
                onChange(RENDERING_STRATEGY_SINGLE);
            }
        }
    }

    render() {
        const {
            value,
            period,
            hasOtherLayers,
            hasOtherTimelineLayers,
            onChange,
        } = this.props;

        if (singleMapPeriods.includes(period.id)) {
            return null;
        }

        let helpText;

        if (hasOtherTimelineLayers) {
            helpText = i18n.t('Only one timeline is allowed.');
        } else if (hasOtherLayers) {
            helpText = i18n.t('Remove other layers to enable split map views.');
        }

        return (
            <RadioGroup
                label={i18n.t('Display periods')}
                value={value}
                onChange={onChange}
                helpText={helpText}
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
        );
    }
}

export default connect((state, props) => {
    const { mapViews } = state.map;

    return {
        hasOtherLayers: !!mapViews.filter(({ id }) => id !== props.layerId)
            .length,
        hasOtherTimelineLayers: !!mapViews.find(
            layer =>
                layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE &&
                layer.id !== props.layerId
        ),
    };
})(RenderingStrategy);
