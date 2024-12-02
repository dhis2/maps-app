import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, InputField, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import { DEFAULT_START_DATE, DEFAULT_END_DATE } from '../../constants/layers.js'
import styles from './StartEndDate.module.css'

const StartEndDate = (props) => {
    const { startDate, endDate, setStartDate, setEndDate } = props
    console.log('🚀 ~ useEffect ~ endDate:', endDate)
    console.log('🚀 ~ useEffect ~ startDate:', startDate)
    const hasDate = startDate !== undefined && endDate !== undefined
    useEffect(() => {
        if (!hasDate) {
            setStartDate({ value: DEFAULT_START_DATE })
            setEndDate({ value: DEFAULT_END_DATE })
        }
    }, [hasDate, setStartDate, setEndDate])

    return hasDate ? (
        <Field
            helpText={i18n.t(
                'Start and end dates are inclusive and will be included in the outputs.'
            )}
        >
            <div className={styles.row}>
                <InputField
                    value={startDate}
                    type="date"
                    onChange={setStartDate}
                    label={i18n.t('Start date')}
                    inputWidth="200px"
                    max="9999-12-31"
                    dataTest="start-date-input"
                />
                <div className={styles.icon}>
                    <IconArrowRight16 color={colors.grey500} />
                </div>
                <InputField
                    value={endDate}
                    type="date"
                    onChange={setEndDate}
                    label={i18n.t('End date')}
                    inputWidth="200px"
                    max="9999-12-31"
                    dataTest="end-date-input"
                />
            </div>
        </Field>
    ) : null
}
StartEndDate.propTypes = {
    setEndDate: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
}

export default connect(null, { setStartDate, setEndDate })(StartEndDate)
