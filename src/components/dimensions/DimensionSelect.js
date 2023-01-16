import { DimensionsPanel } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Popover, IconChevronDown24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useUserSettings } from '../UserSettingsProvider.js'
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
            order: 'displayName:asc',
            paging: false,
        }),
    },
}

const DimensionSelect = ({ dimension, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dimensions = useSelector((state) => state.dimensions)
    const { nameProperty } = useUserSettings()
    const { error, data } = useDataQuery(DIMENSIONS_QUERY, {
        variables: { nameProperty },
    })
    const dropdownRef = useRef()

    if (!data?.dimensions.dimensions) {
        return null
    }

    const findDimension = (id) =>
        data.dimensions.dimensions.find((d) => d.id === id)
    const selected = findDimension(dimension)

    const onDimensionClick = (dim) => {
        if (dim !== dimension) {
            onChange(findDimension(dim))
        }
        setIsOpen(false)
    }

    return (
        <Fragment>
            <div onClick={() => setIsOpen(true)} className={styles.dropdown}>
                <label>{i18n.t('Dimension')}</label>
                <div ref={dropdownRef}>
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
                            dimensions={data.dimensions.dimensions}
                            onDimensionClick={onDimensionClick}
                            selectedIds={[dimension]}
                        />
                    </div>
                </Popover>
            )}
        </Fragment>
    )
}

DimensionSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
}

export default DimensionSelect
