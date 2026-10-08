import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { RELATIVE_PERIODS, getFilters } from './pluginHostHelpers.js'
import styles from './styles/select.module.css'

export const FiltersSelect = ({
    orgUnits,
    periodPlaceholder,
    orgUnitPlaceholder,
    onApply,
}) => {
    const [period, setPeriod] = useState('')
    const [orgUnitInput, setOrgUnitInput] = useState('')

    const onSubmit = (event) => {
        event.preventDefault()
        onApply(getFilters(period, orgUnitInput, orgUnits))
    }

    const onClear = () => {
        setPeriod('')
        setOrgUnitInput('')
        onApply({})
    }

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <label className={cx(styles.field, styles.period)}>
                <span>Period filter</span>
                <input
                    type="text"
                    className={styles.input}
                    list="plugin-host-periods"
                    data-test="plugin-host-period-filter"
                    placeholder={periodPlaceholder}
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                />
                <datalist id="plugin-host-periods">
                    {Object.entries(RELATIVE_PERIODS).map(([id, name]) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </datalist>
            </label>
            <label className={cx(styles.field, styles.orgUnits)}>
                <span>Org unit filter (ids)</span>
                <input
                    type="text"
                    className={styles.input}
                    list="plugin-host-org-units"
                    data-test="plugin-host-org-unit-filter"
                    placeholder={orgUnitPlaceholder}
                    value={orgUnitInput}
                    onChange={(event) => setOrgUnitInput(event.target.value)}
                />
                <datalist id="plugin-host-org-units">
                    {orgUnits.map(({ id, name }) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </datalist>
            </label>
            <button type="submit" data-test="plugin-host-apply-filters">
                Apply filters
            </button>
            <button type="button" onClick={onClear}>
                Clear
            </button>
        </form>
    )
}

FiltersSelect.propTypes = {
    orgUnitPlaceholder: PropTypes.string.isRequired,
    orgUnits: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })
    ).isRequired,
    periodPlaceholder: PropTypes.string.isRequired,
    onApply: PropTypes.func.isRequired,
}
