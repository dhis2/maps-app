import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import { DEFAULT_START_DATE, DEFAULT_END_DATE } from '../../constants/layers.js'
import { DatePicker } from '../core/index.js'
import styles from '../edit/styles/LayerDialog.module.css'

const StartEndDates = (props) => {
    const {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        errorText,
        className,
    } = props
    const hasDate = startDate !== undefined && endDate !== undefined

    useEffect(() => {
        if (!hasDate) {
            //setStartDate(DEFAULT_START_DATE)
            //setEndDate(DEFAULT_END_DATE)
        }
    }, [hasDate, setStartDate, setEndDate])

    return hasDate ? (
        <Fragment>
            <DatePicker
                label={i18n.t('Start date')}
                defaultVal={startDate.replace(/-/g, '')}
                onBlur={setStartDate}
                className={className || styles.select}
            />
            <DatePicker
                label={i18n.t('End date')}
                defaultVal={endDate.replace(/-/g, '')}
                onBlur={setEndDate}
                className={className || styles.select}
            />
            {errorText && (
                <div key="error" className={styles.error}>
                    {errorText}
                </div>
            )}
        </Fragment>
    ) : null
}

StartEndDates.propTypes = {
    setEndDate: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    className: PropTypes.string,
    endDate: PropTypes.string,
    errorText: PropTypes.string,
    startDate: PropTypes.string,
}

export default connect(null, { setStartDate, setEndDate })(StartEndDates)
