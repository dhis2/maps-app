import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { range } from 'lodash/fp';
import SelectField from '../core/SelectField';
import ColorScaleSelect from '../core/ColorScaleSelect';
import { setClassification, setColorScale } from '../../actions/layerEdit';
import { getClassificationTypes } from '../../constants/layers';
import {
    defaultColorScaleName,
    defaultClasses,
    defaultColorScale,
    getColorPalette,
    getColorScale,
} from '../../util/colors';
import { CLASSIFICATION_EQUAL_INTERVALS } from '../../constants/layers';
import styles from './styles/Classification.module.css';

const classRange = range(3, 10).map(num => ({
    id: num,
    name: num.toString(),
})); // 3 - 9

const Classification = ({
    method,
    classes,
    colorScale,
    setClassification,
    setColorScale,
}) => {
    const colorScaleName = colorScale
        ? getColorScale(colorScale)
        : defaultColorScaleName;

    return [
        <SelectField
            key="classification"
            label={i18n.t('Classification')}
            value={method || CLASSIFICATION_EQUAL_INTERVALS}
            items={getClassificationTypes()}
            onChange={method => setClassification(method.id)}
            className={styles.select}
        />,
        <div key="scale">
            <SelectField
                label={i18n.t('Classes')}
                value={classes !== undefined ? classes : defaultClasses}
                items={classRange}
                onChange={item =>
                    setColorScale(getColorPalette(colorScaleName, item.id))
                }
                className={styles.classes}
            />
            <ColorScaleSelect
                palette={colorScale ? colorScale : defaultColorScale}
                onChange={setColorScale}
                width={190}
                className={styles.scale}
            />
            <div className={styles.clear} />
        </div>,
    ];
};

Classification.propTypes = {
    method: PropTypes.number,
    classes: PropTypes.number,
    colorScale: PropTypes.string,
    setClassification: PropTypes.func.isRequired,
    setColorScale: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        classes: layerEdit.classes,
        colorScale: layerEdit.colorScale,
    }),
    { setClassification, setColorScale }
)(Classification);
