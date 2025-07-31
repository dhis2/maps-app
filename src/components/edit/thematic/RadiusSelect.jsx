import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { setRadiusLow, setRadiusHigh } from '../../../actions/layerEdit.js'
import {
    THEMATIC_RADIUS_LOW,
    THEMATIC_RADIUS_HIGH,
    THEMATIC_RADIUS_MIN,
    THEMATIC_RADIUS_MAX,
} from '../../../constants/layers.js'
import { NumberField } from '../../core/index.js'
import styles from './styles/RadiusSelect.module.css'

export const isValidRadius = (
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH
) =>
    !isNaN(radiusLow) &&
    !isNaN(radiusHigh) &&
    radiusLow <= radiusHigh &&
    radiusLow >= THEMATIC_RADIUS_MIN &&
    radiusHigh <= THEMATIC_RADIUS_MAX

const RadiusSelect = ({
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH,
    setRadiusLow,
    setRadiusHigh,
    className,
}) => (
    <Fragment>
        <NumberField
            label={i18n.t('Low radius')}
            value={isNaN(radiusLow) ? '' : radiusLow}
            min={THEMATIC_RADIUS_MIN}
            max={THEMATIC_RADIUS_MAX}
            onChange={setRadiusLow}
            className={className}
        />
        <NumberField
            label={i18n.t('High radius')}
            value={isNaN(radiusHigh) ? '' : radiusHigh}
            min={THEMATIC_RADIUS_MIN}
            max={THEMATIC_RADIUS_MAX}
            onChange={setRadiusHigh}
            className={className}
        />
        {!isValidRadius(radiusLow, radiusHigh) && (
            <div className={styles.error}>
                <Help warning>
                    {radiusHigh < radiusLow
                        ? i18n.t(
                              'High radius should be greater than low radius'
                          )
                        : i18n.t(
                              'Radius should be between {{min}} and {{max}}',
                              {
                                  min: THEMATIC_RADIUS_MIN,
                                  max: THEMATIC_RADIUS_MAX,
                              }
                          )}
                </Help>
            </div>
        )}
    </Fragment>
)

RadiusSelect.propTypes = {
    setRadiusHigh: PropTypes.func.isRequired,
    setRadiusLow: PropTypes.func.isRequired,
    className: PropTypes.string,
    radiusHigh: PropTypes.number,
    radiusLow: PropTypes.number,
}

export default connect(
    ({ layerEdit }) => ({
        radiusLow: layerEdit.radiusLow,
        radiusHigh: layerEdit.radiusHigh,
    }),
    { setRadiusLow, setRadiusHigh }
)(RadiusSelect)
