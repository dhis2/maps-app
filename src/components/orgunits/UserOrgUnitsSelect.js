import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FirstLevel from './UserOrgUnitsFirstLevel';
import SecondLevel from './UserOrgUnitsSecondLevel';
import ThirdLevel from './UserOrgUnitsThirdLevel';
import './UserOrgUnits.css';

const styles = {
    title: {
        paddingTop: 27,
        color: 'rgba(0, 0, 0, 0.3)',
    },
    container: {
        display: 'flex',
        paddingTop: 12,
        margin: -8,
    },
    level: {
        flex: '33%',
        paddingBottom: 12,
        cursor: 'pointer',
        margin: 8,
        textAlign: 'center',
    },
    icon: {
        display: 'block',
        margin: '10px auto',
    },
};

const levels = [{
    id: 'USER_ORGUNIT',
    label: 'Main',
    Icon: FirstLevel,
}, {
    id: 'USER_ORGUNIT_CHILDREN',
    label: 'Below',
    Icon: SecondLevel,
}, {
    id: 'USER_ORGUNIT_GRANDCHILDREN',
    label: '2 x below',
    Icon: ThirdLevel,
}];

const UserOrgUnitSelect = ({ selected, onChange, style }) => (
    <div className='UserOrgUnits' style={style}>
        <div style={styles.title}>User organisation units</div>
        <div style={styles.container}>
            {levels.map(level => {
                const isSelected = selected.indexOf(level.id) !== -1;

                return (
                    <div
                        key={level.id}
                        className={isSelected ? 'selected' : null}
                        style={{
                            ...styles.level,
                            outline: isSelected ? '3px solid orange' : '1px solid #bbb',
                        }}
                        onClick={() => onChange(!isSelected ? [...selected, level.id] : selected.filter(id => id !== level.id))}
                    >
                        <level.Icon style={styles.icon} />
                        {level.label}
                    </div>
                );
            })}
        </div>
    </div>
);

UserOrgUnitSelect.propTypes = {
    selected:  PropTypes.array,
    onChange: PropTypes.func,
};

export default UserOrgUnitSelect;
