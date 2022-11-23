import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/UserOrgUnitSelect.module.css'
import FirstLevel from './UserOrgUnitsFirstLevel.js'
import SecondLevel from './UserOrgUnitsSecondLevel.js'
import ThirdLevel from './UserOrgUnitsThirdLevel.js'

const getLevels = () => [
    {
        id: 'USER_ORGUNIT',
        label: i18n.t('Main'),
        Icon: FirstLevel,
    },
    {
        id: 'USER_ORGUNIT_CHILDREN',
        label: i18n.t('Below'),
        Icon: SecondLevel,
    },
    {
        id: 'USER_ORGUNIT_GRANDCHILDREN',
        label: i18n.t('2 x below'),
        Icon: ThirdLevel,
    },
]

// TODO: Use ImageSelect.js component for selectable image?
const UserOrgUnitSelect = ({ selected, onChange, style }) => (
    <div className={styles.userOrgUnits} style={style}>
        <div className={styles.title}>{i18n.t('User organisation units')}</div>
        <div className={styles.container}>
            {getLevels().map((level) => {
                const isSelected = selected.includes(level.id)

                return (
                    <div
                        key={level.id}
                        className={cx(styles.level, {
                            [styles.selectedLevel]: isSelected,
                        })}
                        onClick={() =>
                            onChange(
                                !isSelected
                                    ? [...selected, level.id]
                                    : selected.filter((id) => id !== level.id)
                            )
                        }
                    >
                        <div className={styles.icon}>
                            <level.Icon />
                        </div>
                        {level.label}
                    </div>
                )
            })}
        </div>
    </div>
)

UserOrgUnitSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    selected: PropTypes.array,
    style: PropTypes.object,
}

export default UserOrgUnitSelect
