import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setBufferRadius } from '../../../actions/layerEdit.js'
import Checkbox from '../../core/Checkbox.jsx'
import NumberField from '../../core/NumberField.jsx'
import styles from './styles/BufferRadius.module.css'

const MIN_RADIUS = 1

// Component to set buffer radius (checkbox toggle and number field)
// radius will be undefined when a layer dialog is opened (can be used to set default value)
// it will be null when the checkbox is unchecked
// it will be empty string when the value is deleted
// it will have a number value when a buffer is typed, or a default set
const BufferRadius = ({
    radius,
    defaultRadius = 1000,
    hasOrgUnitField,
    disabled,
    className,
    forceShowNumberField = false,
    setBufferRadius,
}) => {
    const isDisabled = disabled || hasOrgUnitField
    const showBuffer =
        forceShowNumberField && !hasOrgUnitField
            ? true
            : radius !== undefined && radius !== null

    return (
        <div className={cx(styles.buffer, className)}>
            <Tooltip
                content={i18n.t(
                    'Draws a buffer area around each point location.'
                )}
                placement="top"
            >
                {forceShowNumberField ? (
                    <div className={styles.labelOnly}>{i18n.t('Buffer')}</div>
                ) : (
                    <Checkbox
                        label={i18n.t('Buffer')}
                        checked={showBuffer}
                        disabled={isDisabled}
                        onChange={(isChecked) =>
                            setBufferRadius(
                                isChecked ? radius || defaultRadius : null
                            )
                        }
                    />
                )}
            </Tooltip>
            {showBuffer && (
                <NumberField
                    label={i18n.t('Radius in meters')}
                    value={Number.isInteger(radius) ? radius : ''}
                    disabled={isDisabled}
                    onChange={(value) =>
                        setBufferRadius(
                            value !== ''
                                ? Math.max(parseInt(value, 10), MIN_RADIUS)
                                : ''
                        )
                    }
                    min={MIN_RADIUS}
                    className={styles.numberField}
                />
            )}
            {hasOrgUnitField && (
                <div className={styles.info}>
                    {i18n.t(
                        "Buffer can't be combined with associated geometry."
                    )}
                </div>
            )}
        </div>
    )
}

BufferRadius.propTypes = {
    setBufferRadius: PropTypes.func.isRequired,
    className: PropTypes.string,
    defaultRadius: PropTypes.number,
    disabled: PropTypes.bool,
    forceShowNumberField: PropTypes.bool,
    hasOrgUnitField: PropTypes.bool,
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default connect(
    ({ layerEdit }) => ({
        radius: layerEdit.areaRadius,
    }),
    { setBufferRadius }
)(BufferRadius)
