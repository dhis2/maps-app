import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { setClassification } from '../../actions/layerEdit';
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../constants/layers';
import { layerDialogStyles } from '../edit/LayerDialogStyles';

const styles = {
    ...layerDialogStyles, // TODO: Only import used styles
};

// Select between user defined (automatic) and predefined legends
export const LegendTypeSelect = ({ method, setClassification }) => (
    <RadioButtonGroup
        name="method"
        valueSelected={
            method === CLASSIFICATION_PREDEFINED
                ? CLASSIFICATION_PREDEFINED
                : CLASSIFICATION_EQUAL_INTERVALS
        }
        onChange={(event, type) => setClassification(type)}
        style={{ ...styles.flexInnerColumnFlow, marginTop: 8 }}
    >
        <RadioButton
            value={CLASSIFICATION_EQUAL_INTERVALS}
            label={i18n.t('Automatic')}
            style={styles.flexInnerColumn}
        />
        <RadioButton
            value={CLASSIFICATION_PREDEFINED}
            label={i18n.t('Predefined')}
            style={styles.flexInnerColumn}
        />
    </RadioButtonGroup>
);

LegendTypeSelect.propTypes = {
    method: PropTypes.number,
    setClassification: PropTypes.func.isRequired,
};

export default connect(
    null,
    { setClassification }
)(LegendTypeSelect);
