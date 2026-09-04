import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../constants/selection.js'
import Checkbox from '../core/Checkbox.jsx'
import {
    FilterDropdownPopover,
    getDropdownPlacement,
} from './FilterDropdownPopover.jsx'
import styles from './styles/SelectionFilterButton.module.css'

const SELECTION_FILTER_OPTIONS = [
    { value: SELECTION_FILTER_SELECTED, label: i18n.t('Selected') },
    { value: SELECTION_FILTER_NOT_SELECTED, label: i18n.t('Not selected') },
]

const SelectionFilterButton = ({ value, onChange }) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const toggleValue = (optionValue) => {
        const next = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue]
        onChange(next)
    }

    const activeOption =
        value.length === 1
            ? SELECTION_FILTER_OPTIONS.find(
                  (option) => option.value === value[0]
              )
            : null
    const buttonLabel = activeOption ? activeOption.label : i18n.t('All')

    const anchorRect = anchorRef.current?.getBoundingClientRect()
    const { dropdownPlacement } = getDropdownPlacement(anchorRect)

    return (
        <>
            <button
                type="button"
                ref={anchorRef}
                className={styles.selectionFilterButton}
                data-test="data-table-selection-filter-button"
                onClick={() => setIsOpen((o) => !o)}
            >
                {buttonLabel}
            </button>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement={dropdownPlacement}
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.selectionFilterPopover}>
                        {SELECTION_FILTER_OPTIONS.map((option) => (
                            <Checkbox
                                key={option.value}
                                label={option.label}
                                checked={value.includes(option.value)}
                                onChange={() => toggleValue(option.value)}
                                className={styles.denseCheckbox}
                            />
                        ))}
                    </div>
                </FilterDropdownPopover>
            )}
        </>
    )
}

SelectionFilterButton.propTypes = {
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default SelectionFilterButton
