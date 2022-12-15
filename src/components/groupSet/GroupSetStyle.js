import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { STYLE_TYPE_COLOR } from '../../constants/layers.js'
import { fetchOrgUnitGroupSet } from '../../util/orgUnits.js'
import GroupStyle from './GroupStyle.js'
import styles from './styles/GroupSetStyle.module.css'

const GroupSetStyle = ({ defaultStyleType = STYLE_TYPE_COLOR, groupSet }) => {
    const [groups, setGroups] = useState([])
    const [error, setError] = useState()

    useEffect(() => {
        fetchOrgUnitGroupSet(groupSet.id)
            .then(setGroups)
            .catch(() =>
                setError(i18n.t('Failed to load organisation unit groups.'))
            )
    }, [groupSet])

    if (error) {
        return <Help error>{error}</Help>
    }

    return (
        <div className={styles.groupSetStyle}>
            {groups.map((group) => (
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
