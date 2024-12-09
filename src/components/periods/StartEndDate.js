import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import styles from './styles/StartEndDate.module.css'

const StartEndDate = (props) => {
    const { startDate, endDate, setStartDate, setEndDate, periodsSettings } =
        props

    const [start, setStart] = useState(startDate.slice(0, 10))
    const [end, setEnd] = useState(endDate.slice(0, 10))

    const hasDate = startDate !== undefined && endDate !== undefined

    const onStartDateChange = ({ calendarDateString: value }) => {
        setStart(value.slice(0, 10))
        setStartDate(value.slice(0, 10))
    }
    const onEndDateChange = ({ calendarDateString: value }) => {
        setEnd(value.slice(0, 10))
        setEndDate(value.slice(0, 10))
    }
    return hasDate ? (
        <Field
            helpText={i18n.t(
                'Start and end dates are inclusive and will be included in the outputs.'
            )}
        >
            <div className={styles.row}>
                <CalendarInput
                    label={i18n.t('Start date')}
                    calendar={periodsSettings.calendar}
                    locale={periodsSettings.locale}
                    date={start.slice(0, 10)}
                    onDateSelect={onStartDateChange}
                    placeholder="YYYY-MM-DD"
                    dataTest="start-date-input"
                />
                <div className={styles.icon}>
                    <IconArrowRight16 color={colors.grey500} />
                </div>
                <CalendarInput
                    label={i18n.t('End date')}
                    calendar={periodsSettings.calendar}
                    locale={periodsSettings.locale}
                    date={end.slice(0, 10)}
                    onDateSelect={onEndDateChange}
                    placeholder="YYYY-MM-DD"
                    dataTest="end-date-input"
                />
            </div>
        </Field>
    ) : null
}
StartEndDate.propTypes = {
    setEndDate: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    endDate: PropTypes.string,
    periodsSettings: PropTypes.object,
    startDate: PropTypes.string,
}

export default connect(null, { setStartDate, setEndDate })(StartEndDate)
