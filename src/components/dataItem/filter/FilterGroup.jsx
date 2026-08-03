import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import {
    addFilter,
    removeFilter,
    changeFilter,
} from '../../../actions/layerEdit.js'
import { useEventDataItems } from '../EventDataItemsProvider.jsx'
import FilterRow from './FilterRow.jsx'
import styles from './styles/FilterGroup.module.css'

const excludeTypes = ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE']

const FilterGroup = ({ filters }) => {
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems({ excludeTypes })

    if (eventDataItems === null) {
        return null
    }

    return (
        <div className={styles.filterGroup}>
            {filters.map((item, index) => (
                <FilterRow
                    key={index}
                    index={index}
                    dataItems={eventDataItems}
                    onChange={(index, item) =>
                        dispatch(changeFilter(index, item))
                    }
                    onRemove={(val) => dispatch(removeFilter(val))}
                    {...item}
                />
            ))}
            <div className={styles.addFilter}>
                <Button onClick={() => dispatch(addFilter())}>
                    {i18n.t('Add filter')}
                </Button>
            </div>
        </div>
    )
}
FilterGroup.propTypes = {
    filters: PropTypes.array.isRequired,
}

export default FilterGroup
