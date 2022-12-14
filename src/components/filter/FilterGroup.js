import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    addFilter,
    removeFilter,
    changeFilter,
} from '../../actions/layerEdit.js'
import { combineDataItems } from '../../util/analytics.js'
import FilterRow from './FilterRow.js'
import styles from './styles/FilterGroup.module.css'

const FilterGroup = ({
    filters = [],
    dataItems,
    program,
    programStage,
    addFilter,
    removeFilter,
    changeFilter,
}) =>
    programStage ? (
        <div className={styles.filterGroup}>
            {filters.map((item, index) => (
                <FilterRow
                    key={index}
                    index={index}
                    dataItems={dataItems}
                    program={program}
                    programStage={programStage}
                    onChange={changeFilter}
                    onRemove={removeFilter}
                    {...item}
                />
            ))}
            <div className={styles.addFilter}>
                <Button basic onClick={() => addFilter()}>
                    {i18n.t('Add filter')}
                </Button>
            </div>
        </div>
    ) : (
        <div className={styles.note}>
            {i18n.t('Filtering is available after selecting a program stage.')}
        </div>
    )

FilterGroup.propTypes = {
    addFilter: PropTypes.func.isRequired,
    changeFilter: PropTypes.func.isRequired,
    removeFilter: PropTypes.func.isRequired,
    dataItems: PropTypes.array,
    filters: PropTypes.array,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default connect(
    (state, { program, programStage }) => ({
        dataItems:
            program && programStage
                ? combineDataItems(
                      state.programTrackedEntityAttributes[program.id],
                      state.programStageDataElements[programStage.id],
                      null,
                      ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE'] // Exclude these value types
                  )
                : [],
    }),
    { addFilter, removeFilter, changeFilter }
)(FilterGroup)
