import i18n from '@dhis2/d2-i18n'
import { Checkbox, Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo, useState } from 'react'
import {
    FILTER_OPTIONS,
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_ORG_UNIT_NAME,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import useOptionSet from '../../../hooks/useOptionSet.js'
import styles from './styles/Filters.module.css'

const SEARCH_THRESHOLD = 8

const getLabel = (value, { renderer, formatValue, optionNames }) => {
    if (value === SENTINEL_NO_VALUE) {
        return i18n.t('No value')
    }
    if (renderer === RENDERER_ICON) {
        return value.split('/').pop()
    }
    return optionNames.get(value) ?? formatValue(value)
}

const OptionLabel = ({ value, label, renderer }) => (
    <span className={value === SENTINEL_NO_VALUE ? styles.emptyOption : ''}>
        {renderer === RENDERER_ICON && value && (
            <img
                className={styles.iconThumbnail}
                src={value}
                alt=""
                onError={(e) => {
                    e.target.style.visibility = 'hidden'
                }}
            />
        )}
        {renderer === RENDERER_COLOR && value && (
            <span
                className={styles.swatch}
                style={{ backgroundColor: value }}
            />
        )}
        {label}
    </span>
)

OptionLabel.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    renderer: PropTypes.string,
}

const OptionsFilter = ({ draft, column, onChange }) => {
    const { options, counts, renderer, optionSetId, formatValue } = column
    const [search, setSearch] = useState('')
    const { optionSet } = useOptionSet(optionSetId)
    const selected = draft?.values ?? []

    const labelledOptions = useMemo(() => {
        const optionNames = new Map(
            optionSet?.options.map(({ code, name }) => [code, name])
        )
        const labelled = options.map(({ value }) => ({
            value,
            label: getLabel(value, { renderer, formatValue, optionNames }),
            count: counts.get(value),
        }))
        // Org unit values are paths: list them by name instead
        return renderer === RENDERER_ORG_UNIT_NAME
            ? labelled.sort((a, b) => a.label.localeCompare(b.label))
            : labelled
    }, [options, counts, renderer, formatValue, optionSet])

    const visibleOptions = search
        ? labelledOptions.filter(({ label }) =>
              label.toLowerCase().includes(search.toLowerCase())
          )
        : labelledOptions
    const visibleValues = visibleOptions.map(({ value }) => value)
    const allVisibleSelected = visibleValues.every((value) =>
        selected.includes(value)
    )

    const setSelected = (values) => onChange({ type: FILTER_OPTIONS, values })

    const toggle = (value) =>
        setSelected(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        )

    // Acts on the visible options only, so a search narrows what it changes
    const toggleVisible = () =>
        setSelected(
            allVisibleSelected
                ? selected.filter((value) => !visibleValues.includes(value))
                : [...new Set([...selected, ...visibleValues])]
        )

    return (
        <div className={styles.stack}>
            {options.length > SEARCH_THRESHOLD && (
                <Input
                    dense
                    initialFocus
                    placeholder={i18n.t('Search values')}
                    value={search}
                    onChange={({ value }) => setSearch(value)}
                    dataTest="data-table-filter-options-search"
                />
            )}
            <div className={styles.optionsMeta}>
                <span>
                    {selected.length
                        ? i18n.t('{{count}} selected', {
                              count: selected.length,
                          })
                        : i18n.t('{{count}} values', {
                              count: options.length,
                          })}
                </span>
                {visibleOptions.length > 0 && (
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={toggleVisible}
                        data-test="data-table-filter-options-toggle-all"
                    >
                        {allVisibleSelected
                            ? i18n.t('Deselect all')
                            : i18n.t('Select all')}
                    </button>
                )}
            </div>
            <ul
                className={styles.optionList}
                data-test="data-table-filter-options-list"
            >
                {visibleOptions.map(({ value, label, count }) => (
                    <li key={value} className={styles.option}>
                        <Checkbox
                            dense
                            className={styles.optionCheckbox}
                            checked={selected.includes(value)}
                            onChange={() => toggle(value)}
                            label={
                                <span className={styles.optionLabel}>
                                    <OptionLabel
                                        value={value}
                                        label={label}
                                        renderer={renderer}
                                    />
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
                        {i18n.t('No values match "{{- search}}"', { search })}
                    </li>
                )}
            </ul>
        </div>
    )
}

OptionsFilter.propTypes = {
    column: PropTypes.shape({
        counts: PropTypes.instanceOf(Map).isRequired,
        formatValue: PropTypes.func.isRequired,
        options: PropTypes.arrayOf(
            PropTypes.shape({ value: PropTypes.string.isRequired })
        ).isRequired,
        optionSetId: PropTypes.string,
        renderer: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default OptionsFilter
