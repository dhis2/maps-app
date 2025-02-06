import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../../core/index.js'
import RemoveFilter from '../../filter/RemoveFilter.jsx'
import FilterSelect from './FilterSelect.jsx'
import styles from './styles/FilterRow.module.css'

const FilterRow = ({
    index,
    dimension,
    filter,
    dataItems,
    onChange,
    onRemove,
}) => {
    if (!dataItems?.length) {
        return null
    }

    const { valueType, optionSet } =
        dataItems.find((d) => d.id === dimension) || {}

    const onSelect = ({ id }, newFilter) => {
        const name = dataItems.filter((d) => d.id === id)[0].name

        if (id !== dimension) {
            // New dimension
            onChange(index, {
                dimension: id,
                name,
                filter: null,
            })
        } else {
            onChange(index, {
                dimension: id,
                name,
                filter: newFilter,
            })
        }
    }

    return (
        <div className={styles.filterRow}>
            <SelectField
                label={i18n.t('Data item')}
                items={dataItems}
                value={dimension || null}
                onChange={onSelect}
                className={styles.dataItemSelect}
            />
            {valueType && (
                <FilterSelect
                    valueType={valueType}
                    optionSetId={optionSet?.id}
                    filter={filter}
                    onChange={(newFilter) =>
                        onSelect({ id: dimension }, newFilter)
                    }
                />
            )}
            <RemoveFilter onClick={() => onRemove(index)} />
        </div>
    )
}

FilterRow.propTypes = {
    dataItems: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    filter: PropTypes.string,
}

export default FilterRow
