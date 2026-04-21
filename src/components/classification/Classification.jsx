import i18n from '@dhis2/d2-i18n'
import { range } from 'lodash/fp'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    setClassification,
    setColorScale,
    setLegendDecimalPlaces,
    setLegendIsolated,
} from '../../actions/layerEdit.js'
import {
    getClassificationTypes,
    CLASSIFICATION_EQUAL_INTERVALS,
    NO_DATA_COLOR,
} from '../../constants/layers.js'
import {
    defaultColorScaleName,
    defaultClasses,
    defaultColorScale,
    getColorPalette,
    getColorScale,
} from '../../util/colors.js'
import {
    SelectField,
    ColorScaleSelect,
    Checkbox,
    ColorPicker,
    NumberField,
    TextField,
} from '../core/index.js'
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
    legendIsolated,
    setClassification,
    setColorScale,
    setLegendDecimalPlaces,
    setLegendIsolated,
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
            <Checkbox
                label={i18n.t('Isolated value')}
                checked={legendIsolated !== undefined}
                onChange={(checked) =>
                    setLegendIsolated(
                        checked ? { value: 0, color: NO_DATA_COLOR } : undefined
                    )
                }
            />
            {legendIsolated !== undefined && (
                <div className={styles.isolatedRow}>
                    <NumberField
                        label={i18n.t('Value')}
                        value={legendIsolated.value}
                        onChange={(value) =>
                            setLegendIsolated({ ...legendIsolated, value })
                        }
                        inputWidth="70px"
                        className={styles.isolatedField}
                    />
                    <ColorPicker
                        label={i18n.t('Color')}
                        color={legendIsolated.color || NO_DATA_COLOR}
                        onChange={(color) =>
                            setLegendIsolated({ ...legendIsolated, color })
                        }
                        width={50}
                        className={styles.isolatedColor}
                    />
                    <TextField
                        label={i18n.t('Name')}
                        value={legendIsolated.name || ''}
                        onChange={(name) =>
                            setLegendIsolated({
                                ...legendIsolated,
                                name: name || undefined,
                            })
                        }
                        className={styles.isolatedName}
                    />
                </div>
            )}
        </div>,
    ]
}

Classification.propTypes = {
    setClassification: PropTypes.func.isRequired,
    setColorScale: PropTypes.func.isRequired,
    setLegendDecimalPlaces: PropTypes.func.isRequired,
    setLegendIsolated: PropTypes.func.isRequired,
    classes: PropTypes.number,
    colorScale: PropTypes.array,
    legendDecimalPlaces: PropTypes.number,
    legendIsolated: PropTypes.shape({
        color: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.number,
    }),
    method: PropTypes.number,
}

export default connect(
    ({ layerEdit }) => ({
        method: layerEdit.method,
        classes: layerEdit.classes,
        colorScale: layerEdit.colorScale,
        legendDecimalPlaces: layerEdit.legendDecimalPlaces,
        legendIsolated: layerEdit.legendIsolated,
    }),
    {
        setClassification,
        setColorScale,
        setLegendDecimalPlaces,
        setLegendIsolated,
    }
)(Classification)
