import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import range from 'lodash/fp/range';
import SelectField from 'd2-ui/lib/select-field/SelectField';
// import ColorScaleSelect from 'd2-ui/lib/legend/ColorScaleSelect.component';
import ColorScaleSelect from '../d2-ui/ColorScaleSelect';
import { setClassification, setColorScale } from '../../actions/layerEdit';
import { classificationTypes } from '../../constants/layers';
import { getColorPalette, getColorScale } from '../../util/colorscale';

const styles = {
    selectField: {
        width: '100%',
        top: -8,
    },
    classes: {
        width: 60,
        marginRight: 16,
        top: -8,
        float: 'left',
    },
    scale: {
        float: 'left',
        width: 200,
    }
};

const classRange = range(3, 10).map(num => ({ id: num, name: num.toString() })); // 3 - 9
const defaultColorScaleName = 'YlOrRd';
const defaultClasses = 5;
const defaultColorScale = getColorPalette(defaultColorScaleName, defaultClasses);

console.log(defaultColorScale);

// TODO: Refactoring
const Classification = ({method, classes, colorScale, setClassification, setColorScale, style }) => {
    const colorScaleName = colorScale ? getColorScale(colorScale.join(',')) : defaultColorScaleName;

    return (
        <div style={style}>
            <SelectField
                label={i18next.t('Classification')}
                value={method || 2}
                items={classificationTypes.map(({ id, name }) => ({ id, name: i18next.t(name) }))}
                onChange={method => setClassification(method.id)}
                style={styles.selectField}
            />
            <div style={styles.selectField}>
                <SelectField
                    label={i18next.t('Classes')}
                    value={classes !== undefined ? classes : defaultClasses}
                    items={classRange}
                    onChange={item => setColorScale(getColorPalette(colorScaleName, item.id))}
                    style={styles.classes}
                />
                <ColorScaleSelect
                    palette={colorScale ? colorScale.join(',') : defaultColorScale.join(',')}
                    onChange={setColorScale}
                    style={styles.scale}
                />
            </div>
        </div>
    );
};

export default connect(
    null,
    { setClassification, setColorScale }
)(Classification);
