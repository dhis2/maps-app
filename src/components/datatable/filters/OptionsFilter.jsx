import i18n from '@dhis2/d2-i18n'
import { Checkbox, Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { getEmptyOptionLabel } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

const SEARCH_THRESHOLD = 8

const OptionsFilter = ({ draft, options, onChange }) => {
    const [search, setSearch] = useState('')
    const selected = draft?.values ?? []

    const visibleOptions = search
        ? options.filter(({ label }) =>
              label.toLowerCase().includes(search.toLowerCase())
          )
        : options

    const setSelected = (values) => onChange({ type: 'options', values })

    const toggle = (value) =>
        setSelected(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        )

    return (
        <div className={styles.stack}>
            {options.length > SEARCH_THRESHOLD && (
                <Input
                    dense
                    autoFocus
                    placeholder={i18n.t('Search options')}
                    value={search}
                    onChange={({ value }) => setSearch(value)}
                />
            )}
            <div className={styles.optionsMeta}>
                <span>
                    {selected.length
                        ? i18n.t('{{count}} selected', {
                              count: selected.length,
                          })
                        : i18n.t('{{count}} options', {
                              count: options.length,
                          })}
                </span>
                <span className={styles.linkButtons}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() =>
                            setSelected([
                                ...new Set([
                                    ...selected,
                                    ...visibleOptions.map((o) => o.value),
                                ]),
                            ])
                        }
                    >
                        {i18n.t('Select all')}
                    </button>
                    <button
                        type="button"
                        className={styles.linkButton}
                        disabled={!selected.length}
                        onClick={() => setSelected([])}
                    >
                        {i18n.t('Deselect all')}
                    </button>
                </span>
            </div>
            <ul className={styles.optionList} data-test="filter-options-list">
                {visibleOptions.map(({ value, label, count, color }) => (
                    <li key={value} className={styles.option}>
                        <Checkbox
                            dense
                            checked={selected.includes(value)}
                            onChange={() => toggle(value)}
                            label={
                                <span
                                    className={
                                        value === '' ? styles.emptyOption : ''
                                    }
                                >
                                    {color && (
                                        <span
                                            className={styles.swatch}
                                            style={{ backgroundColor: color }}
                                        />
                                    )}
                                    {label || getEmptyOptionLabel()}
                                </span>
                            }
                        />
                        <span className={styles.count}>{count}</span>
                    </li>
                ))}
                {!visibleOptions.length && (
                    <li className={styles.noMatch}>
                        {i18n.t('No options match "{{- search}}"', {
                            search,
                        })}
                    </li>
                )}
            </ul>
        </div>
    )
}

OptionsFilter.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            color: PropTypes.string,
            count: PropTypes.number,
            label: PropTypes.string,
            value: PropTypes.string,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default OptionsFilter
