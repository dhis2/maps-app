import i18n from '@dhis2/d2-i18n'
import {
    Field,
    IconArrowRight16,
    InputField,
    CalendarInput,
    colors,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import { DEFAULT_START_DATE, DEFAULT_END_DATE } from '../../constants/layers.js'
import styles from './StartEndDate.module.css'

const StartEndDate = (props) => {
    const { startDate, endDate, setStartDate, setEndDate, periodsSettings } =
        props

    console.log('🚀 ~ StartEndDate ~ periodsSettings:', periodsSettings)

    const [start, setStart] = useState(startDate)
    const [end, setEnd] = useState(endDate)

    console.log('🚀 ~ StartEndDate ~ startDate:', typeof startDate)
    console.log('🚀 ~ StartEndDate ~ endDate:', typeof endDate)
    const hasDate = startDate !== undefined && endDate !== undefined

    const onStartDateChange = ({ calendarDateString: value }) => {
        setStart(value)
        setStartDate(value)
    }
    const onEndDateChange = ({ calendarDateString: value }) => {
        setEnd(value)
        setEndDate(value)
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
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    periodsSettings: PropTypes.object,
}

export default connect(null, { setStartDate, setEndDate })(StartEndDate)
