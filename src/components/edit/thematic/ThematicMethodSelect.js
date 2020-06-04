import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setThematicMethod } from '../../../actions/layerEdit';

const styles = {
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid #ccc',
        paddingBottom: 10,
        marginBottom: 10,
    },
    radio: {
        flex: 1,
    },
};

// Select between choropleth and proportional symbols for thematic layers
export const ThematicMethodSelect = ({
    method = 'choropleth',
    setThematicMethod,
    classes,
}) => (
    <RadioGroup
        name="method"
        value={method}
        onChange={(event, method) => setThematicMethod(method)}
        className={classes.radioGroup}
    >
        <Radio
            value={'choropleth'}
            label={i18n.t('Choropleth')}
            className={classes.radio}
        />
        <Radio
            value={'proportional'}
            label={i18n.t('Proportional symbols')}
            className={classes.radio}
        />
    </RadioGroup>
);

ThematicMethodSelect.propTypes = {
    method: PropTypes.string,
    setThematicMethod: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setThematicMethod })(
    withStyles(styles)(ThematicMethodSelect)
);
