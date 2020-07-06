import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
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
        outline: `3px solid ${theme.palette.primary.main}`,
    },
    icon: {
        display: 'block',
        margin: '10px auto',
    },
});

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
const UserOrgUnitSelect = ({ classes, selected, onChange, style }) => (
    <div className="UserOrgUnits" style={style}>
        <div className={classes.title}>{i18n.t('User organisation units')}</div>
        <div className={classes.container}>
            {getLevels().map(level => {
                const isSelected = selected.includes(level.id);

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
