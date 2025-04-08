import { DimensionsPanel, useCachedDataQuery } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Popover, IconChevronDown24, Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import styles from './styles/DimensionSelect.module.css'

// Include the following dimension types
const dimensionTypes = [
    'CATEGORY',
    'CATEGORY_OPTION_GROUP_SET',
    'ORGANISATION_UNIT_GROUP_SET',
]

// Load above dimension types
const DIMENSIONS_QUERY = {
    dimensions: {
        resource: 'dimensions',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`, 'dimensionType'],
            filter: `dimensionType:in:[${dimensionTypes.join(',')}]`,
            order: `${nameProperty}:asc`,
            paging: false,
        }),
    },
}

const DimensionSelect = ({ dimension, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { nameProperty } = useCachedDataQuery()
    const { error, data } = useDataQuery(DIMENSIONS_QUERY, {
        variables: { nameProperty },
    })
    const dropdownRef = useRef()

    const findDimension = (id) =>
        data && data.dimensions.dimensions.find((d) => d.id === id)
    const selected = findDimension(dimension)

    const onDimensionClick = (dim) => {
        if (dim !== dimension) {
            onChange(findDimension(dim))
        }
        setIsOpen(false)
    }

    if (error) {
        return <Help error={true}>{error.message}</Help>
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)} className={styles.dropdown}>
                <label>{i18n.t('Dimension')}</label>
                <div ref={dropdownRef} data-test="dimension-select-field">
                    <span>{selected ? selected.name : ''}</span>
                    <IconChevronDown24 />
                </div>
            </div>
            {isOpen && (
                <Popover
                    reference={dropdownRef}
                    placement="bottom-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.dimensions}>
                        <DimensionsPanel
                            dimensions={data?.dimensions?.dimensions}
                            onDimensionClick={onDimensionClick}
                            selectedIds={[dimension]}
                        />
                    </div>
                </Popover>
            )}
        </>
    )
}

DimensionSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
}

export default DimensionSelect
