import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

const styles = () => ({
    label: {
        padding: '16px 0 8px',
    },
    radio: {
        padding: '4px 12px',
    },
});

const PeriodDisplay = ({ value = 'aggregate', onChange, classes }) => {
    return (
        <FormControl component="fieldset" className={classes.control}>
            <FormLabel component="legend" className={classes.label}>
                Display periods
            </FormLabel>
            <RadioGroup
                aria-label="Period display"
                name="periodd-display"
                value={value}
                onChange={(evt, value) => onChange(value)}
            >
                <FormControlLabel
                    value="aggregate"
                    control={<Radio className={classes.radio} />}
                    label="Aggregate"
                />
                <FormControlLabel
                    value="timeline"
                    control={<Radio className={classes.radio} />}
                    label="Timeline"
                />
                <FormControlLabel
                    value="spit"
                    control={<Radio className={classes.radio} />}
                    label="Split map views"
                />
            </RadioGroup>
        </FormControl>
    );
};

PeriodDisplay.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PeriodDisplay);
