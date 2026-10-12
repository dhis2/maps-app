import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { getDatePresets } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

const DateFilter = ({ draft, onChange }) => {
    const filter = { type: 'date', ...draft }
    const presets = getDatePresets()
    const update = (changes) => onChange({ ...filter, ...changes })

    return (
        <div className={styles.stack}>
            <div
                className={styles.presets}
                role="group"
                aria-label={i18n.t('Quick ranges')}
            >
                {presets.map(({ id, label, from, to }) => (
                    <button
                        type="button"
                        key={id}
                        className={cx(styles.preset, {
                            [styles.presetActive]:
                                filter.from === from && filter.to === to,
                        })}
                        onClick={() => update({ from, to })}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className={styles.dateInputs}>
                <InputField
                    dense
                    type="date"
                    label={i18n.t('From')}
                    value={filter.from ?? ''}
                    max={filter.to || undefined}
                    onChange={({ value }) => update({ from: value })}
                    dataTest="filter-date-from"
                />
                <InputField
                    dense
                    type="date"
                    label={i18n.t('To')}
                    value={filter.to ?? ''}
                    min={filter.from || undefined}
                    onChange={({ value }) => update({ to: value })}
                    dataTest="filter-date-to"
                />
            </div>
        </div>
    )
}

DateFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default DateFilter
