import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setColorScale } from '../../actions/layerEdit.js'
import { getColorPalette } from '../../util/colors.js'
import { ColorScaleSelect } from '../core/index.js'
import styles from './styles/Classification.module.css'

const ContinuousScale = ({ colorScale, setColorScale }) => {
    if (!colorScale) {
        setColorScale(getColorPalette('RdYlBu_reverse', 9))
    }
    return (
        <div>
            <div className={styles.title}>{i18n.t('Color scale')}</div>
            <ColorScaleSelect
                palette={
                    colorScale
                        ? colorScale
                        : getColorPalette('RdYlBu_reverse', 9)
                }
                onChange={setColorScale}
                width={190}
                heat={true}
                className={styles.scale}
            />
        </div>
    )
}

ContinuousScale.propTypes = {
    setColorScale: PropTypes.func.isRequired,
    colorScale: PropTypes.array,
}

export default connect(
    ({ layerEdit }) => ({
        colorScale: layerEdit.colorScale,
    }),
    { setColorScale }
)(ContinuousScale)
