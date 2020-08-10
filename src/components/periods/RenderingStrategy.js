import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    FormControl,
    FormLabel,
    FormControlLabel,
    RadioGroup,
    Radio,
} from '@material-ui/core';
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

const styles = () => ({
    label: {
        padding: '16px 0 8px',
    },
    radio: {
        padding: '4px 12px',
    },
    message: {
        paddingTop: 4,
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: '18px',
    },
});

class RenderingStrategy extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        layerId: PropTypes.string,
        hasOtherLayers: PropTypes.bool,
        hasOtherTimelineLayers: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
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

    onChange = (evt, value) => this.props.onChange(value);

    render() {
        const {
            value,
            period,
            hasOtherLayers,
            hasOtherTimelineLayers,
            classes,
        } = this.props;

        if (singleMapPeriods.includes(period.id)) {
            return null;
        }

        return (
            <FormControl component="fieldset" className={classes.control}>
                <FormLabel component="legend" className={classes.label}>
                    {i18n.t('Display periods')}
                </FormLabel>
                <RadioGroup
                    aria-label="Period display"
                    name="period-display"
                    value={value}
                    onChange={this.onChange}
                >
                    <FormControlLabel
                        value="SINGLE"
                        control={<Radio className={classes.radio} />}
                        label={i18n.t('Single (aggregate)')}
                    />
                    <FormControlLabel
                        value="TIMELINE"
                        control={<Radio className={classes.radio} />}
                        label={i18n.t('Timeline')}
                        disabled={hasOtherTimelineLayers}
                    />
                    <FormControlLabel
                        value="SPLIT_BY_PERIOD"
                        control={<Radio className={classes.radio} />}
                        label={i18n.t('Split map views')}
                        disabled={
                            hasOtherLayers ||
                            invalidSplitViewPeriods.includes(period.id)
                        }
                    />
                </RadioGroup>

                <div className={classes.message}>
                    {hasOtherTimelineLayers && (
                        <div>{i18n.t('Only one timeline is allowed.')}</div>
                    )}
                    {hasOtherLayers && (
                        <div>
                            {i18n.t(
                                'Remove other layers to enable split map views.'
                            )}
                        </div>
                    )}
                </div>
            </FormControl>
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
})(withStyles(styles)(RenderingStrategy));
