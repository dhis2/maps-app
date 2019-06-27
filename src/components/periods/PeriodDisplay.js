import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
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
});

class PeriodDisplay extends Component {
    static propTypes = {
        value: PropTypes.string,
        period: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        value: 'aggregate',
        period: {},
    };

    componentDidUpdate(prevProps) {
        const { value, period, onChange } = this.props;

        if (period !== prevProps.period) {
            if (singleMapPeriods.includes(period.id) && value !== 'aggregate') {
                onChange('aggregate');
            } else if (
                invalidSplitViewPeriods.includes(period.id) &&
                value === 'split'
            ) {
                // TODO: Switch to 'timeline' when we support it
                onChange('aggregate');
            }
        }
    }

    onChange = (evt, value) => this.props.onChange(value);

    render() {
        const { value, period, classes } = this.props;

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
                    name="periodd-display"
                    value={value}
                    onChange={this.onChange}
                >
                    <FormControlLabel
                        value="aggregate"
                        control={<Radio className={classes.radio} />}
                        label="Aggregate"
                    />
                    {/* Will be enabled in a later timeline PR
                    <FormControlLabel
                        value="timeline"
                        control={<Radio className={classes.radio} />}
                        label="Timeline"
                    />
                    */}
                    <FormControlLabel
                        value="split"
                        control={<Radio className={classes.radio} />}
                        label="Split map views"
                        disabled={invalidSplitViewPeriods.includes(period.id)}
                    />
                </RadioGroup>
            </FormControl>
        );
    }
}

export default withStyles(styles)(PeriodDisplay);
