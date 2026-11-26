import i18n from '@dhis2/d2-i18n'
import { Checkbox } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    RENDERER_COLOR,
    RENDERER_GEOMETRY,
    RENDERER_ICON,
    SENTINEL_NO_VALUE,
} from '../../../constants/dataTable.js'
import { isDarkColor } from '../../../util/colors.js'
import GeometrySymbol from '../GeometrySymbol.jsx'
import styles from './styles/Filters.module.css'

// Long lists show their first values; a condition or "Find in list" narrows them
const MAX_LISTED = 100

const ValueLabel = ({ entry, renderer, isMonospace }) => {
    if (entry.key === SENTINEL_NO_VALUE) {
        return <span className={styles.emptyOption}>{i18n.t('No value')}</span>
    }
    // A color value is painted as in its table cell; a legend class shows its color, a geometry type its symbol
    const isPainted = renderer === RENDERER_COLOR && !entry.isGone
    return (
        <span
            className={cx({
                [styles.monoLabel]: isMonospace,
                [styles.paintedLabel]: isPainted,
                [styles.lightLabel]: isPainted && isDarkColor(entry.value),
            })}
            style={isPainted ? { backgroundColor: entry.value } : undefined}
        >
            {renderer === RENDERER_ICON && !entry.isGone && (
                <img
                    className={styles.iconThumbnail}
                    src={entry.value}
                    alt=""
                    onError={(e) => {
                        e.target.style.visibility = 'hidden'
                    }}
                />
            )}
            {renderer === RENDERER_GEOMETRY && (
                <GeometrySymbol
                    type={entry.value}
                    className={styles.geometry}
                />
            )}
            {entry.color && !entry.isGone && (
                <span
                    className={styles.swatch}
                    style={{ backgroundColor: entry.color }}
                />
            )}
            {entry.label}
        </span>
    )
}

ValueLabel.propTypes = {
    entry: PropTypes.object.isRequired,
    isMonospace: PropTypes.bool,
    renderer: PropTypes.string,
}

// The column's values with a checkbox each: every value starts checked, unchecked ones are left out
const ValueList = ({
    listed,
    hidden,
    excluded,
    renderer,
    isMonospace,
    onChange,
}) => {
    const excludedKeys = new Set(excluded)
    const listedKeys = listed.map(({ key }) => key)
    const checkedCount = listedKeys.filter(
        (key) => !excludedKeys.has(key)
    ).length
    const shown = listed.slice(0, MAX_LISTED)

    const toggle = (key) => {
        const next = new Set(excludedKeys)
        if (next.has(key)) {
            next.delete(key)
        } else {
            next.add(key)
        }
        onChange([...next], key)
    }

    // Act on the listed values only, so a condition or a search narrows what they change
    const checkAll = () =>
        onChange(excluded.filter((key) => !listedKeys.includes(key)))
    const uncheckAll = () =>
        onChange([...new Set([...excluded, ...listedKeys])])

    return (
        <div className={styles.stack}>
            <div className={styles.optionsMeta}>
                <span aria-live="polite">
                    {i18n.t('{{checked}} of {{count}} checked', {
                        checked: checkedCount,
                        count: listed.length,
                    })}
                </span>
                <span>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={checkAll}
                        data-test="data-table-filter-values-check-all"
                    >
                        {i18n.t('Select all')}
                    </button>
                    {' · '}
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={uncheckAll}
                        data-test="data-table-filter-values-uncheck-all"
                    >
                        {i18n.t('Deselect all')}
                    </button>
                </span>
            </div>
            <ul
                className={styles.optionList}
                data-test="data-table-filter-values-list"
            >
                {shown.map((entry) => (
                    <li
                        key={entry.key}
                        className={cx(styles.option, {
                            [styles.optionGone]: entry.isGone,
                        })}
                    >
                        <Checkbox
                            dense
                            className={styles.optionCheckbox}
                            checked={!excludedKeys.has(entry.key)}
                            onChange={() => toggle(entry.key)}
                            label={
                                <span className={styles.optionLabel}>
                                    <ValueLabel
                                        entry={entry}
                                        renderer={renderer}
                                        isMonospace={isMonospace}
                                    />
                                    <span className={styles.count}>
                                        {entry.count}
                                    </span>
                                </span>
                            }
                        />
                    </li>
                ))}
                {!listed.length && (
                    <li className={styles.noMatch}>
                        {i18n.t('No value matches')}
                    </li>
                )}
            </ul>
            {listed.length > MAX_LISTED && (
                <span className={styles.listNote}>
                    {i18n.t('Showing the first {{shown}} values.', {
                        shown: MAX_LISTED,
                    })}
                    <br />
                    {i18n.t('Set a condition to reach the others.')}
                </span>
            )}
            {hidden > 0 && (
                <span className={styles.listNote}>
                    {i18n.t('{{count}} values hidden by the condition', {
                        count: hidden,
                        defaultValue: '{{count}} value hidden by the condition',
                        defaultValue_plural:
                            '{{count}} values hidden by the condition',
                    })}
                </span>
            )}
        </div>
    )
}

ValueList.propTypes = {
    excluded: PropTypes.arrayOf(PropTypes.string).isRequired,
    hidden: PropTypes.number.isRequired,
    listed: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired,
    isMonospace: PropTypes.bool,
    renderer: PropTypes.string,
}

export default ValueList
