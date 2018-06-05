import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import range from 'lodash/fp/range';
import { SelectField } from '@dhis2/d2-ui-core';
import ColorScaleSelect from '../d2-ui/ColorScaleSelect';
import { setClassification, setColorScale } from '../../actions/layerEdit';
import { classificationTypes } from '../../constants/layers';
import {
    defaultColorScaleName,
    defaultClasses,
    defaultColorScale,
    getColorPalette,
    getColorScale,
} from '../../util/colorscale';

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
    },
};

const classRange = range(3, 10).map(num => ({ id: num, name: num.toString() })); // 3 - 9

// TODO: Refactoring
const Classification = ({
    method,
    classes,
    colorScale,
    setClassification,
    setColorScale,
    style,
}) => {
    const colorScaleName = colorScale
        ? getColorScale(colorScale)
        : defaultColorScaleName;

    return (
        <div style={style}>
            <SelectField
                label={i18n.t('Classification')}
                value={method || 2}
                items={classificationTypes.map(({ id, name }) => ({
                    id,
                    name: i18n.t(name),
                }))}
                onChange={method => setClassification(method.id)}
                style={styles.selectField}
            />
            <div style={styles.selectField}>
                <SelectField
                    label={i18n.t('Classes')}
                    value={classes !== undefined ? classes : defaultClasses}
                    items={classRange}
                    onChange={item =>
                        setColorScale(getColorPalette(colorScaleName, item.id))
                    }
                    style={styles.classes}
                />
                <ColorScaleSelect
                    palette={colorScale ? colorScale : defaultColorScale}
                    onChange={setColorScale}
                    style={styles.scale}
                />
            </div>
        </div>
    );
};

export default connect(null, { setClassification, setColorScale })(
    Classification
);
