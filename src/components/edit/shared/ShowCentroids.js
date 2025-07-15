import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setShowCentroids } from '../../../actions/layerEdit.js'
import { EVENT_CENTROID_DEFAULT } from '../../../constants/layers.js'
import Checkbox from '../../core/Checkbox.js'
import styles from './styles/ShowCentroids.module.css'

const ShowCentroids = ({
    showCentroids,
    eventCoordinateField,
    className,
    setShowCentroids,
}) => {
    useEffect(() => {
        setShowCentroids(!EVENT_CENTROID_DEFAULT.includes(eventCoordinateField))
    }, [setShowCentroids, eventCoordinateField])

    return (
        <div className={cx(styles.centroids, className)}>
            <Tooltip
                content={i18n.t('Convert polygons to their centroids.')}
                placement="top"
            >
                <Checkbox
                    label={i18n.t('Centroids')}
                    disabled={true} // Until prop showCentroids can be saved with mapViews
                    checked={showCentroids}
                    onChange={(isChecked) => setShowCentroids(isChecked)}
                />
            </Tooltip>
        </div>
    )
}

ShowCentroids.propTypes = {
    setShowCentroids: PropTypes.func.isRequired,
    className: PropTypes.string,
    eventCoordinateField: PropTypes.string,
    showCentroids: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        showCentroids: layerEdit.showCentroids,
        eventCoordinateField: layerEdit.eventCoordinateField,
    }),
    { setShowCentroids }
)(ShowCentroids)
