import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Radio from '../../core/Radio';
import { RadioGroup } from '@material-ui/core';
import { setThematicMapType } from '../../../actions/layerEdit';

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

// Select between choropleth and bubble map for thematic layers
export const ThematicMapTypeSelect = ({
    type = 'CHOROPLETH',
    setThematicMapType,
    classes,
}) => (
    <RadioGroup
        name="type"
        value={type}
        onChange={(event, type) => setThematicMapType(type)}
        className={classes.radioGroup}
    >
        <Radio
            value={'CHOROPLETH'}
            label={i18n.t('Choropleth')}
            className={classes.radio}
        />
        <Radio
            value={'BUBBLE'}
            label={i18n.t('Bubble map')}
            className={classes.radio}
        />
    </RadioGroup>
);

ThematicMapTypeSelect.propTypes = {
    type: PropTypes.string,
    setThematicMapType: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(null, { setThematicMapType })(
    withStyles(styles)(ThematicMapTypeSelect)
);
