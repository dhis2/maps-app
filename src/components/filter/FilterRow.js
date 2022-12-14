import PropTypes from 'prop-types'
import React from 'react'
import DataItemSelect from '../dataItem/DataItemSelect.js'
import FilterSelect from './FilterSelect.js'
import RemoveFilter from './RemoveFilter.js'
import styles from './styles/FilterRow.module.css'

const FilterRow = ({
    index,
    dimension,
    filter,
    dataItems,
    program,
    programStage,
    onChange,
    onRemove,
}) => {
    let dataItem

    if (dataItems && dimension) {
        dataItem = dataItems.filter((d) => d.id === dimension)[0]
    }

    const onSelect = (dim, filter) => {
        const name = dataItems.filter((d) => d.id === dim)[0].name

        if (dim !== dimension) {
            // New dimension
            onChange(index, {
                dimension: dim,
                name,
                filter: null,
            })
        } else {
            onChange(index, {
                dimension: dim,
                name,
                filter,
            })
        }
    }

    return (
        <div className={styles.filterRow}>
            <DataItemSelect
                value={dimension || null}
                program={program}
                programStage={programStage}
                excludeTypes={[
                    'FILE_RESOURCE',
                    'ORGANISATION_UNIT',
                    'COORDINATE',
                ]}
                onChange={(dataItem) => onSelect(dataItem.id, filter)}
                className={styles.dataItemSelect}
            />
            {dimension && (
                <FilterSelect
                    {...dataItem}
                    filter={filter}
                    onChange={(filter) => onSelect(dimension, filter)}
                />
            )}
            <RemoveFilter onClick={() => onRemove(index)} />
        </div>
    )
}

FilterRow.propTypes = {
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    dataItems: PropTypes.array,
    dimension: PropTypes.string,
    filter: PropTypes.string,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default FilterRow
