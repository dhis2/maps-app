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

    // Acts on the visible options only, so a search narrows what it touches
    const visibleValues = visibleOptions.map((o) => o.value)
    const allVisibleSelected = visibleValues.every((v) => selected.includes(v))

    const toggleVisible = () =>
        setSelected(
            allVisibleSelected
                ? selected.filter((v) => !visibleValues.includes(v))
                : [...new Set([...selected, ...visibleValues])]
        )

    const getToggleLabel = () => {
        if (!search) {
            return allVisibleSelected
                ? i18n.t('Deselect all')
                : i18n.t('Select all')
        }
        return allVisibleSelected
            ? i18n.t('Deselect {{count}} matching', {
                  count: visibleValues.length,
              })
            : i18n.t('Select {{count}} matching', {
                  count: visibleValues.length,
              })
    }

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
                {visibleOptions.length > 0 && (
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={toggleVisible}
                        data-test="filter-options-toggle-all"
                    >
                        {getToggleLabel()}
                    </button>
                )}
            </div>
            <ul className={styles.optionList} data-test="filter-options-list">
                {visibleOptions.map(({ value, label, count, color }) => (
                    <li key={value} className={styles.option}>
                        {/* The label fills the row, so the whole row toggles */}
                        <Checkbox
                            dense
                            className={styles.optionCheckbox}
                            checked={selected.includes(value)}
                            onChange={() => toggle(value)}
                            label={
                                <span className={styles.optionLabel}>
                                    <span
                                        className={
                                            value === ''
                                                ? styles.emptyOption
                                                : ''
                                        }
                                    >
                                        {color && (
                                            <span
                                                className={styles.swatch}
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                        )}
                                        {label || getEmptyOptionLabel()}
                                    </span>
                                    <span className={styles.count}>
                                        {count}
                                    </span>
                                </span>
                            }
                        />
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
