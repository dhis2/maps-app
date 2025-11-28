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
import { useEventDataItems } from '../../../hooks/useEventDataItems.js'
import FilterRow from './FilterRow.jsx'
import styles from './styles/FilterGroup.module.css'

const excludeTypes = ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE']

const FilterGroup = ({ filters, program, programStage }) => {
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
        excludeTypes,
    })

    if (!programStage) {
        return (
            <div className={styles.note}>
                {i18n.t(
                    'Filtering is available after selecting a program stage.'
                )}
            </div>
        )
    }

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
                <Button basic onClick={() => dispatch(addFilter())}>
                    {i18n.t('Add filter')}
                </Button>
            </div>
        </div>
    )
}
FilterGroup.propTypes = {
    filters: PropTypes.array.isRequired,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default FilterGroup
