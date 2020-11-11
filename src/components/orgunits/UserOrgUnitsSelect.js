import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import FirstLevel from './UserOrgUnitsFirstLevel';
import SecondLevel from './UserOrgUnitsSecondLevel';
import ThirdLevel from './UserOrgUnitsThirdLevel';
import styles from './styles/UserOrgUnitSelect.module.css';

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
];

// TODO: Use ImageSelect.js component for selectable image?
const UserOrgUnitSelect = ({ selected, onChange, style }) => (
    <div className={styles.userOrgUnits} style={style}>
        <div className={styles.title}>{i18n.t('User organisation units')}</div>
        <div className={styles.container}>
            {getLevels().map(level => {
                const isSelected = selected.includes(level.id);

                return (
                    <div
                        key={level.id}
                        className={`${styles.level} ${
                            isSelected ? styles.selectedLevel : ''
                        }`}
                        onClick={() =>
                            onChange(
                                !isSelected
                                    ? [...selected, level.id]
                                    : selected.filter(id => id !== level.id)
                            )
                        }
                    >
                        <div className={styles.icon}>
                            <level.Icon />
                        </div>
                        {level.label}
                    </div>
                );
            })}
        </div>
    </div>
);

UserOrgUnitSelect.propTypes = {
    selected: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default UserOrgUnitSelect;
