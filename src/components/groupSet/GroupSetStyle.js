import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { STYLE_TYPE_COLOR } from '../../constants/layers.js'
import {
    ORG_UNITS_GROUP_SET_QUERY,
    parseGroupSet,
} from '../../util/orgUnits.js'
import GroupStyle from './GroupStyle.js'
import styles from './styles/GroupSetStyle.module.css'

const GroupSetStyle = ({ defaultStyleType = STYLE_TYPE_COLOR, groupSet }) => {
    const [groups, setGroups] = useState([])
    const { error: err, refetch } = useDataQuery(ORG_UNITS_GROUP_SET_QUERY, {
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

    if (err) {
        return (
            <Help error>
                {i18n.t('Failed to load organisation unit groups.')}
            </Help>
        )
    }

    return (
        <div data-test="group-set-style" className={styles.groupSetStyle}>
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
