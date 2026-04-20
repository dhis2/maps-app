import i18n from '@dhis2/d2-i18n'
import { range } from 'lodash/fp'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    setClassification,
    setColorScale,
    setLegendDecimalPlaces,
} from '../../actions/layerEdit.js'
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

const DECIMAL_PLACES_AUTO = 'auto'

const decimalPlacesItems = [
    { id: DECIMAL_PLACES_AUTO, name: i18n.t('Auto') },
    ...range(0, 5).map((num) => ({ id: num, name: num.toString() })),
] // Auto, 0 - 4

const Classification = ({
    method,
    classes,
    colorScale,
    legendDecimalPlaces,
    setClassification,
    setColorScale,
    setLegendDecimalPlaces,
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
            <div className={styles.classesRow}>
                <SelectField
                    label={i18n.t('Classes')}
                    value={classes !== undefined ? classes : defaultClasses}
                    items={classRange}
                    onChange={(item) =>
                        setColorScale(getColorPalette(colorScaleName, item.id))
                    }
                    className={styles.classes}
                />
                <SelectField
                    label={i18n.t('Decimal places')}
                    value={
                        legendDecimalPlaces !== undefined
                            ? legendDecimalPlaces
                            : DECIMAL_PLACES_AUTO
                    }
                    items={decimalPlacesItems}
                    onChange={(item) =>
                        setLegendDecimalPlaces(
                            item.id === DECIMAL_PLACES_AUTO
                                ? undefined
                                : item.id
                        )
                    }
                    className={styles.decimalPlaces}
                />
            </div>
            <ColorScaleSelect
                palette={colorScale ? colorScale : defaultColorScale}
                onChange={setColorScale}
                width={190}
                className={styles.scale}
            />
        </div>,
    ]
}

Classification.propTypes = {
    setClassification: PropTypes.func.isRequired,
    setColorScale: PropTypes.func.isRequired,
    setLegendDecimalPlaces: PropTypes.func.isRequired,
    classes: PropTypes.number,
    colorScale: PropTypes.array,
    legendDecimalPlaces: PropTypes.number,
    method: PropTypes.number,
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        classes: layerEdit.classes,
        colorScale: layerEdit.colorScale,
        legendDecimalPlaces: layerEdit.legendDecimalPlaces,
    }),
    { setClassification, setColorScale, setLegendDecimalPlaces }
)(Classification)
