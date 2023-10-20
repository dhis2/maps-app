import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import styles from './styles/PeriodTypeSelect.module.css'

export const MONTHLY = 'monthly'
export const DAILY = 'daily'

const PeriodTypeSelect = ({ type, onChange }) => (
    <div className={styles.periodTypeButtons}>
        <Button
            primary={type === MONTHLY}
            secondary={type !== MONTHLY}
            small
            onClick={() => onChange(MONTHLY)}
        >
            {i18n.t('Monthly')}
        </Button>
        <Button
            primary={type === DAILY}
            secondary={type !== DAILY}
            small
            onClick={() => onChange(DAILY)}
        >
            {i18n.t('Daily')}
        </Button>
    </div>
)

PeriodTypeSelect.propTypes = {
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default PeriodTypeSelect
