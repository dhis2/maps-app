import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import ColorScaleSelect from 'd2-ui/lib/legend/ColorScaleSelect.component';
import { setClassification, setColorScale } from '../../actions/layerEdit';
import { classificationTypes } from '../../constants/layers';

const styles = {
    selectField: {
        marginRight: 24,
        width: 200,
        top: -8,
    },
    classes: {
        width: 50,
        top: -8,
    },
};

const Classification = ({method, classes, colorScale, setClassification, setColorScale, style }) => (
    <div style={style}>
        <SelectField
            key='type'
            label={i18next.t('Classification')}
            value={method || 2}
            items={classificationTypes.map(({ id, name }) => ({ id, name: i18next.t(name) }))}
            onChange={method => setClassification(method.id)}
            style={styles.selectField}
        />
        <ColorScaleSelect
            key='scale'
            label={i18next.t('Classes')}
            onChange={colorScale => setColorScale(colorScale)}
            classesStyle={styles.classes}
        />
    </div>
);

Classification.propTypes = {

};

export default connect(
    null,
    { setClassification, setColorScale }
)(Classification);
