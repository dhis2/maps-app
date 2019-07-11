import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import i18n from '@dhis2/d2-i18n';
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
        paddingTop: 10,
        fontStyle: 'italic',
        fontSize: 14,
    },
});

class RenderingStrategy extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        layerId: PropTypes.string,
        hasOtherLayers: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        value: 'SINGLE',
        period: {},
    };

    componentDidUpdate(prevProps) {
        const { value, period, onChange } = this.props;

        if (period !== prevProps.period) {
            if (singleMapPeriods.includes(period.id) && value !== 'SINGLE') {
                onChange('SINGLE');
            } else if (
                invalidSplitViewPeriods.includes(period.id) &&
                value === 'SPLIT_BY_PERIOD'
            ) {
                // TODO: Switch to 'timeline' when we support it
                onChange('SINGLE');
            }
        }
    }

    onChange = (evt, value) => this.props.onChange(value);

    render() {
        const { value, period, hasOtherLayers, classes } = this.props;

        if (singleMapPeriods.includes(period.id)) {
            return null;
        }

        return (
            <FormControl component="fieldset" className={classes.control}>
                <FormLabel component="legend" className={classes.label}>
                    Display periods
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
                        label="Single (aggregate)"
                    />
                    {/* Will be enabled in a later timeline PR
                    <FormControlLabel
                        value="TIMELINE"
                        control={<Radio className={classes.radio} />}
                        label="Timeline"
                    />
                    */}
                    <FormControlLabel
                        value="SPLIT_BY_PERIOD"
                        control={<Radio className={classes.radio} />}
                        label="Split map views"
                        disabled={
                            hasOtherLayers ||
                            invalidSplitViewPeriods.includes(period.id)
                        }
                    />
                </RadioGroup>
                {hasOtherLayers && (
                    <div className={classes.message}>
                        {i18n.t(
                            'Remove other layers to enable split map view.'
                        )}
                    </div>
                )}
            </FormControl>
        );
    }
}

export default connect((state, props) => {
    return {
        hasOtherLayers: !!state.map.mapViews.filter(
            ({ id }) => id !== props.layerId
        ).length,
    };
})(withStyles(styles)(RenderingStrategy));
