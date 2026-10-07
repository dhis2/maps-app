import i18n from '@dhis2/d2-i18n'
import { Tooltip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setGeometryCentroid } from '../../../actions/layerEdit.js'
import { EVENT_CENTROID_DEFAULT } from '../../../constants/layers.js'
import Checkbox from '../../core/Checkbox.jsx'
import styles from './styles/GeometryCentroid.module.css'

// Checks both fields since either one's geometry can end up being plotted
export const needsGeometryCentroid = (
    eventCoordinateFieldType,
    eventCoordinateFieldFallbackType
) =>
    (!!eventCoordinateFieldType &&
        !EVENT_CENTROID_DEFAULT.includes(eventCoordinateFieldType)) ||
    (!!eventCoordinateFieldFallbackType &&
        !EVENT_CENTROID_DEFAULT.includes(eventCoordinateFieldFallbackType))

const GeometryCentroid = ({
    tab,
    geometryCentroid,
    eventCoordinateFieldType,
    eventCoordinateFieldFallbackType,
    className,
    setGeometryCentroid,
}) => {
    useEffect(() => {
        if (!eventCoordinateFieldType && !eventCoordinateFieldFallbackType) {
            return
        }
        setGeometryCentroid(
            needsGeometryCentroid(
                eventCoordinateFieldType,
                eventCoordinateFieldFallbackType
            )
        )
    }, [
        setGeometryCentroid,
        eventCoordinateFieldType,
        eventCoordinateFieldFallbackType,
    ])

    return (
        <div>
            {tab === 'data' && geometryCentroid && (
                <div className={styles.noticeCompact}>
                    <NoticeBox warning>
                        {i18n.t('May cause slow layer loading.')}
                    </NoticeBox>
                </div>
            )}
            {tab === 'style' && (
                <div
                    className={cx(styles.centroid, className)}
                    style={{ display: 'none' }} // Until prop geometryCentroid can be saved with mapViews
                >
                    <Tooltip
                        content={i18n.t('Convert polygons to their centroids.')}
                        placement="top"
                    >
                        <Checkbox
                            label={i18n.t('Centroids')}
                            checked={geometryCentroid}
                            onChange={(isChecked) =>
                                setGeometryCentroid(isChecked)
                            }
                        />
                    </Tooltip>
                </div>
            )}
            {tab === 'style' && geometryCentroid && (
                <div className={cx(styles.notice)}>
                    <NoticeBox info>
                        {i18n.t('Polygons are represented by their centroids.')}
                    </NoticeBox>
                </div>
            )}
        </div>
    )
}

GeometryCentroid.propTypes = {
    setGeometryCentroid: PropTypes.func.isRequired,
    className: PropTypes.string,
    eventCoordinateFieldFallbackType: PropTypes.string,
    eventCoordinateFieldType: PropTypes.string,
    geometryCentroid: PropTypes.bool,
    tab: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        geometryCentroid: layerEdit?.geometryCentroid,
        eventCoordinateFieldType: layerEdit?.eventCoordinateFieldType,
        eventCoordinateFieldFallbackType:
            layerEdit?.eventCoordinateFieldFallbackType,
    }),
    { setGeometryCentroid }
)(GeometryCentroid)
