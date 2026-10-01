import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { ORG_UNIT_GROUPS_GRANULARITY } from '../../constants/dataTable.js'
import { isOrgUnitGroupFilter } from '../../util/filter.js'
import {
    buildOrgUnitGroupTree,
    formatOrgUnitNodeLabel,
    getOrgUnitSearchMatches,
} from '../../util/orgUnitGroups.js'
import { flattenAllNodes } from '../../util/prefixTree.js'
import GroupFilterPopover from './GroupFilterPopover.jsx'
import useGroupFilterInput from './useGroupFilterInput.js'

const HELP_CONTENT = (
    <div>
        <div>{i18n.t('Select a country, region, district or facility')}</div>
        <div>{i18n.t('to match the rows under it, or type to search')}</div>
    </div>
)

const getAppliedString = (filterValue) => {
    if (isOrgUnitGroupFilter(filterValue)) {
        return filterValue.searchDerived ? filterValue.searchText : ''
    }
    return typeof filterValue === 'string' ? filterValue : ''
}

const parseFilterValue = (filterValue) => ({
    selectedPrefixes:
        isOrgUnitGroupFilter(filterValue) && !filterValue.searchDerived
            ? filterValue.prefixes
            : [],
    appliedString: getAppliedString(filterValue),
})

const OrgUnitGroupFilterInput = ({
    name,
    onChange,
    onClear,
    filterValue,
    options,
    idToName,
}) => {
    const getMatches = useCallback(
        (tree, normalizedSearch) =>
            getOrgUnitSearchMatches(tree, normalizedSearch, idToName),
        [idToName]
    )

    const commitSearch = useCallback(
        (text, { tree, onChange: onChangeArg }) => {
            const matches = getOrgUnitSearchMatches(
                tree,
                text.toLowerCase(),
                idToName
            )
            const nodeByKey = new Map(
                flattenAllNodes(tree).map((node) => [node.key, node])
            )
            const matchedPrefixes = [...matches.matchedKeys]
                .map((key) => nodeByKey.get(key))
                .filter(Boolean)
                .map((node) => node.prefix)
            onChangeArg({
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: matchedPrefixes,
                searchDerived: true,
                searchText: text,
            })
        },
        [idToName]
    )

    const groupFilter = useGroupFilterInput({
        onChange,
        onClear,
        filterValue,
        options,
        granularity: ORG_UNIT_GROUPS_GRANULARITY,
        buildTree: buildOrgUnitGroupTree,
        getMatches,
        parseFilterValue,
        commitSearch,
    })

    return (
        <GroupFilterPopover
            {...groupFilter}
            name={name}
            helpContent={HELP_CONTENT}
            customFilterTag={i18n.t('Select matches')}
            formatLabel={(node) => formatOrgUnitNodeLabel(node, idToName)}
        />
    )
}

OrgUnitGroupFilterInput.propTypes = {
    idToName: PropTypes.instanceOf(Map).isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string }))
        .isRequired,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    filterValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object,
    ]),
}

export default OrgUnitGroupFilterInput
