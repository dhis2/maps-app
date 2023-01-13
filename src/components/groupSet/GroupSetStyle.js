import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { STYLE_TYPE_COLOR } from '../../constants/layers.js'
import { parseGroupSet } from '../../util/orgUnits.js'
import GroupStyle from './GroupStyle.js'
import styles from './styles/GroupSetStyle.module.css'

const GROUP_SETS_QUERY = {
    groupSets: {
        resource: 'organisationUnitGroupSets',
        id: ({ id }) => id,
        params: {
            fields: ['organisationUnitGroups[id,name,color,symbol]'],
        },
    },
}

const GroupSetStyle = ({ defaultStyleType = STYLE_TYPE_COLOR, groupSet }) => {
    const [groups, setGroups] = useState([])
    const { error, refetch } = useDataQuery(GROUP_SETS_QUERY, {
        lazy: true,
        onComplete: ({ groupSets }) => {
            const groupsWithColors = parseGroupSet({
                organisationUnitGroups: groupSets.organisationUnitGroups,
            })
            setGroups(groupsWithColors)
        },
    })

    useEffect(() => {
        if (groupSet) {
            refetch({ id: groupSet.id })
        }
    }, [groupSet, refetch])

    if (error) {
        return (
            <Help error>
                {i18n.t('Failed to load organisation unit groups.')}
            </Help>
        )
    }

    return (
        <div className={styles.groupSetStyle}>
            {groups?.map((group) => (
                <GroupStyle
                    key={group.id}
                    styleType={defaultStyleType}
                    {...group}
                />
            ))}
        </div>
    )
}

GroupSetStyle.propTypes = {
    defaultStyleType: PropTypes.string,
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default GroupSetStyle
