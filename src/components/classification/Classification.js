import i18n from '@dhis2/d2-i18n'
import { range } from 'lodash/fp'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setClassification, setColorScale } from '../../actions/layerEdit.js'
import {
    getClassificationTypes,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../constants/layers.js'
import {
    defaultColorScaleName,
    defaultClasses,
    defaultColorScale,
    getColorPalette,
    getColorScale,
} from '../../util/colors.js'
import { SelectField, ColorScaleSelect } from '../core/index.js'
import styles from './styles/Classification.module.css'

const classRange = range(3, 10).map((num) => ({
    id: num,
    name: num.toString(),
})) // 3 - 9

const Classification = ({
    method,
    classes,
    colorScale,
    setClassification,
    setColorScale,
}) => {
    const colorScaleName = colorScale
        ? getColorScale(colorScale)
        : defaultColorScaleName

    return [
        <SelectField
            key="classification"
            label={i18n.t('Classification')}
            value={method || CLASSIFICATION_EQUAL_INTERVALS}
            items={getClassificationTypes()}
            onChange={(method) => setClassification(method.id)}
            className={styles.select}
        />,
        <div key="scale">
            <SelectField
                label={i18n.t('Classes')}
                value={classes !== undefined ? classes : defaultClasses}
                items={classRange}
                onChange={(item) =>
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
    ]
}

Classification.propTypes = {
    setClassification: PropTypes.func.isRequired,
    setColorScale: PropTypes.func.isRequired,
    classes: PropTypes.number,
    colorScale: PropTypes.array,
    method: PropTypes.number,
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        classes: layerEdit.classes,
        colorScale: layerEdit.colorScale,
    }),
    { setClassification, setColorScale }
)(Classification)
