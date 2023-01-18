import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
    addFilter,
    removeFilter,
    changeFilter,
} from '../../actions/layerEdit.js'
import { useProgramStageDataElements } from '../../hooks/useProgramStageDataElements.js'
import { useProgramTrackedEntityAttributes } from '../../hooks/useProgramTrackedEntityAttributes.js'
import { combineDataItems } from '../../util/analytics.js'
import FilterRow from './FilterRow.js'
import styles from './styles/FilterGroup.module.css'

const FilterGroup = ({ filters = [], program, programStage }) => {
    const { dataElements, setProgramStageIdForDataElements } =
        useProgramStageDataElements()
    const { programAttributes, setProgramIdForProgramAttributes } =
        useProgramTrackedEntityAttributes()
    const dispatch = useDispatch()

    useEffect(() => {
        if (program) {
            setProgramIdForProgramAttributes(program.id)
        }
        if (programStage) {
            setProgramStageIdForDataElements(programStage.id)
        }
    }, [
        program,
        programStage,
        setProgramIdForProgramAttributes,
        setProgramStageIdForDataElements,
    ])

    if (!programStage) {
        return (
            <div className={styles.note}>
                {i18n.t(
                    'Filtering is available after selecting a program stage.'
                )}
            </div>
        )
    }

    if (dataElements === null || programAttributes === null) {
        return null
    }

    const dataItems = [
        ...combineDataItems(programAttributes, dataElements, null, [
            'FILE_RESOURCE',
            'ORGANISATION_UNIT',
            'COORDINATE',
        ]),
    ]

    return (
        <div className={styles.filterGroup}>
            {filters.map((item, index) => (
                <FilterRow
                    key={index}
                    index={index}
                    dataItems={dataItems}
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
    filters: PropTypes.array,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default FilterGroup
