import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FirstLevel from './UserOrgUnitsFirstLevel';
import SecondLevel from './UserOrgUnitsSecondLevel';
import ThirdLevel from './UserOrgUnitsThirdLevel';
import './UserOrgUnits.css';

const styles = theme => ({
    title: {
        color: theme.palette.text.secondary,
    },
    container: {
        display: 'flex',
    },
    level: {
        flex: '33%',
        cursor: 'pointer',
        margin: 5,
        textAlign: 'center',
        outline: `1px solid ${theme.palette.divider}`,
    },
    selectedLevel: {
        outline: `3px solid ${theme.palette.secondary.light}`,
    },
    icon: {
        display: 'block',
        margin: '10px auto',
    },
});

const levels = [
    {
        id: 'USER_ORGUNIT',
        label: 'Main',
        Icon: FirstLevel,
    },
    {
        id: 'USER_ORGUNIT_CHILDREN',
        label: 'Below',
        Icon: SecondLevel,
    },
    {
        id: 'USER_ORGUNIT_GRANDCHILDREN',
        label: '2 x below',
        Icon: ThirdLevel,
    },
];

// TODO: Use ImageSelect.js component for selectable image?
const UserOrgUnitSelect = ({ classes, selected, onChange, style }) => (
    <div className="UserOrgUnits" style={style}>
        <div className={classes.title}>User organisation units</div>
        <div className={classes.container}>
            {levels.map(level => {
                const isSelected = selected.indexOf(level.id) !== -1;

                return (
                    <div
                        key={level.id}
                        className={`${classes.level} ${
                            isSelected ? classes.selectedLevel : ''
                        }`}
                        onClick={() =>
                            onChange(
                                !isSelected
                                    ? [...selected, level.id]
                                    : selected.filter(id => id !== level.id)
                            )
                        }
                    >
                        <div className={classes.icon}>
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
    classes: PropTypes.object.isRequired,
    selected: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default withStyles(styles)(UserOrgUnitSelect);
