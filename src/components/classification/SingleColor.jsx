import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import { range } from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {
    setColorScale,
    setLegendDecimalPlaces,
} from '../../actions/layerEdit.js'
import { THEMATIC_COLOR } from '../../constants/layers.js'
import { ColorPicker, SelectField } from '../core/index.js'
import styles from './styles/Classification.module.css'

const DECIMAL_PLACES_AUTO = 'auto'

const decimalPlacesItems = [
    { id: DECIMAL_PLACES_AUTO, name: i18n.t('Auto') },
    ...range(0, 5).map((num) => ({ id: num, name: num.toString() })),
]

const SingleColor = ({
    color,
    legendDecimalPlaces,
    setColorScale,
    setLegendDecimalPlaces,
}) => {
    useEffect(() => {
        if (!color || color.length !== 7) {
            setColorScale(THEMATIC_COLOR)
        }
    }, [color, setColorScale])

    return color ? (
        <div className={styles.singleColorRow}>
            <ColorPicker
                label={i18n.t('Color')}
                color={color}
                onChange={setColorScale}
                width={100}
                className={styles.singleColorField}
            />
            <SelectField
                label={i18n.t('Decimal places')}
                value={legendDecimalPlaces ?? DECIMAL_PLACES_AUTO}
                items={decimalPlacesItems}
                onChange={(item) =>
                    setLegendDecimalPlaces(
                        item.id === DECIMAL_PLACES_AUTO ? undefined : item.id
                    )
                }
                className={cx(styles.decimalPlaces, styles.singleColorField)}
            />
        </div>
    ) : null
}

SingleColor.propTypes = {
    setColorScale: PropTypes.func.isRequired,
    setLegendDecimalPlaces: PropTypes.func.isRequired,
    color: PropTypes.string,
    legendDecimalPlaces: PropTypes.number,
}

export default connect(
    ({ layerEdit }) => ({
        color: layerEdit.colorScale,
        legendDecimalPlaces: layerEdit.legendDecimalPlaces,
    }),
    { setColorScale, setLegendDecimalPlaces }
)(SingleColor)
