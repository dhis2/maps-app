import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setGeometryCentroid } from '../../../actions/layerEdit.js'
import { EVENT_CENTROID_DEFAULT } from '../../../constants/layers.js'
import Checkbox from '../../core/Checkbox.js'
import styles from './styles/GeometryCentroid.module.css'

const GeometryCentroid = ({
    geometryCentroid,
    eventCoordinateField,
    className,
    setGeometryCentroid,
}) => {
    useEffect(() => {
        setGeometryCentroid(
            !EVENT_CENTROID_DEFAULT.includes(eventCoordinateField)
        )
    }, [setGeometryCentroid, eventCoordinateField])

    return (
        <div className={cx(styles.centroid, className)}>
            <Tooltip
                content={i18n.t('Convert polygons to their centroids.')}
                placement="top"
            >
                <Checkbox
                    label={i18n.t('Centroids')}
                    disabled={true} // Until prop geometryCentroid can be saved with mapViews
                    checked={geometryCentroid}
                    onChange={(isChecked) => setGeometryCentroid(isChecked)}
                />
            </Tooltip>
        </div>
    )
}

GeometryCentroid.propTypes = {
    setGeometryCentroid: PropTypes.func.isRequired,
    className: PropTypes.string,
    eventCoordinateField: PropTypes.string,
    geometryCentroid: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        geometryCentroid: layerEdit.geometryCentroid,
        eventCoordinateField: layerEdit.eventCoordinateField,
    }),
    { setGeometryCentroid }
)(GeometryCentroid)
