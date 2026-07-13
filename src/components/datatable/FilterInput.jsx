import i18n from '@dhis2/d2-i18n'
import { Input, Popover, Tooltip, IconInfo16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import useOptionSet from '../../hooks/useOptionSet.js'
import Checkbox from '../core/Checkbox.jsx'
import styles from './styles/FilterInput.module.css'

const NUMERIC_FILTER_HELP = (
    <div>
        <div>{'> 5 — ' + i18n.t('greater than 5')}</div>
        <div>{'>= 5 — ' + i18n.t('greater than or equal to 5')}</div>
        <div>{'< 5, <= 5 — ' + i18n.t('less than (or equal to) 5')}</div>
        <div>{'2, > 8 — ' + i18n.t('equal to 2 OR greater than 8')}</div>
        <div>{'> 3 & < 8 — ' + i18n.t('greater than 3 AND less than 8')}</div>
    </div>
)

// Shared popover UI — label resolution is injected so it never needs to
// know whether it's an option-set column or a plain categorical one.
const MultiSelectPopover = ({
    dataKey,
    layerId,
    filterValue,
    options,
    resolveLabel,
}) => {
    const dispatch = useDispatch()
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const selected = Array.isArray(filterValue) ? filterValue : []

    const toggleValue = (value) => {
        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value]
        next.length
            ? dispatch(setDataFilter(layerId, dataKey, next))
            : dispatch(clearDataFilter(layerId, dataKey))
    }

    const buttonLabel =
        selected.length === 0
            ? i18n.t('All')
            : i18n.t('{{count}} selected', { count: selected.length })

    return (
        <>
            <button
                type="button"
                ref={anchorRef}
                className={styles.multiSelectButton}
                data-test={`data-table-column-filter-multiselect-${dataKey}`}
                onClick={() => setIsOpen((o) => !o)}
            >
                {buttonLabel}
            </button>
            {isOpen && (
                <Popover
                    reference={anchorRef}
                    placement="bottom-start"
                    arrow={false}
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.multiSelectPopover}>
                        {options.map(({ value }) => (
                            <Checkbox
                                key={value}
                                label={resolveLabel(value)}
                                checked={selected.includes(value)}
                                onChange={() => toggleValue(value)}
                            />
                        ))}
                    </div>
                </Popover>
            )}
        </>
    )
}

MultiSelectPopover.propTypes = {
    dataKey: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string }))
        .isRequired,
    resolveLabel: PropTypes.func.isRequired,
    filterValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    layerId: PropTypes.string,
}

// Plain categorical columns (legend, type): raw value IS the display label.
const MultiSelectFilter = (props) => (
    <MultiSelectPopover {...props} resolveLabel={(value) => value} />
)

// Option-set-backed event columns: translate stored code -> display name.
// useOptionSet/useDataQuery is only ever mounted here, never for legend/type,
// since those columns never have an optionSetId.
const OptionSetMultiSelectFilter = ({ optionSetId, ...props }) => {
    const { optionSet } = useOptionSet(optionSetId)
    const resolveLabel = (value) =>
        optionSet?.options.find((o) => o.code === value)?.name ?? value
    return <MultiSelectPopover {...props} resolveLabel={resolveLabel} />
}

OptionSetMultiSelectFilter.propTypes = {
    optionSetId: PropTypes.string.isRequired,
}

const FilterInput = ({ type, dataKey, name, options, optionSetId }) => {
    const dispatch = useDispatch()
    const dataTable = useSelector((state) => state.dataTable)
    const map = useSelector((state) => state.map)

    const overlay =
        dataTable && map.mapViews.find((layer) => layer.id === dataTable)

    let layerId
    let filters
    if (overlay) {
        layerId = overlay.id
        filters = overlay.dataFilters || {}
    }

    const filterValue = filters?.[dataKey]

    if (options?.length) {
        return optionSetId ? (
            <OptionSetMultiSelectFilter
                dataKey={dataKey}
                layerId={layerId}
                filterValue={filterValue}
                options={options}
                optionSetId={optionSetId}
            />
        ) : (
            <MultiSelectFilter
                dataKey={dataKey}
                layerId={layerId}
                filterValue={filterValue}
                options={options}
            />
        )
    }

    const stringFilterValue = typeof filterValue === 'string' ? filterValue : ''

    const onChange = ({ value }) =>
        value !== ''
            ? dispatch(setDataFilter(layerId, dataKey, value))
            : dispatch(clearDataFilter(layerId, dataKey))

    return (
        <span
            className={
                type === 'number' ? styles.numericFilterWrapper : undefined
            }
        >
            <Input
                dataTest={`data-table-column-filter-input-${name}`}
                dense
                placeholder={type === 'number' ? '> 5, < 8' : i18n.t('Search')}
                value={stringFilterValue}
                onChange={onChange}
            />
            {type === 'number' && (
                <Tooltip content={NUMERIC_FILTER_HELP} placement="top">
                    <span
                        className={styles.helpIcon}
                        data-test="data-table-numeric-filter-help"
                    >
                        <IconInfo16 />
                    </span>
                </Tooltip>
            )}
        </span>
    )
}

FilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    optionSetId: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
}

export default FilterInput
