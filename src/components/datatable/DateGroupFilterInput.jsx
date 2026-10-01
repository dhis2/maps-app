import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { DATE_GROUPS_GRANULARITY } from '../../constants/dataTable.js'
import {
    buildDateGroupTree,
    formatNodeLabel,
    getSearchMatches,
} from '../../util/dateGroups.js'
import { isDateGroupFilter } from '../../util/filter.js'
import GroupFilterPopover from './GroupFilterPopover.jsx'
import useGroupFilterInput from './useGroupFilterInput.js'

const HELP_CONTENT = (
    <div>
        <div>{i18n.t('Select a year, month, day or hour')}</div>
        <div>{i18n.t('to match the events under it, or type to search')}</div>
    </div>
)
const DATE_INPUT_DISALLOWED = /[^0-9\-:. T]/g

const parseFilterValue = (filterValue) => ({
    selectedPrefixes: isDateGroupFilter(filterValue)
        ? filterValue.prefixes
        : [],
    appliedString: typeof filterValue === 'string' ? filterValue : '',
})

const sanitizeInput = (value) => value.replace(DATE_INPUT_DISALLOWED, '')

const commitSearch = (text, { onChange }) => onChange(text)

const DateGroupFilterInput = ({
    name,
    onChange,
    onClear,
    filterValue,
    options,
    type,
}) => {
    const buildTree = useCallback(
        (realValues) => buildDateGroupTree(realValues, type),
        [type]
    )

    const groupFilter = useGroupFilterInput({
        onChange,
        onClear,
        filterValue,
        options,
        granularity: DATE_GROUPS_GRANULARITY,
        buildTree,
        getMatches: getSearchMatches,
        parseFilterValue,
        commitSearch,
        sanitizeInput,
    })

    return (
        <GroupFilterPopover
            {...groupFilter}
            name={name}
            helpContent={HELP_CONTENT}
            customFilterTag={i18n.t('Contains')}
            formatLabel={(node) => formatNodeLabel(node, i18n.language)}
        />
    )
}

DateGroupFilterInput.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string }))
        .isRequired,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    filterValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object,
    ]),
}

export default DateGroupFilterInput
