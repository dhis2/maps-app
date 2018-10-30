import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';

const positions = ['topleft', 'topright', 'bottomleft', 'bottomright'];

const styles = theme => ({
    root: {
        width: 120,
        paddingLeft: 30,
    },
    label: {
        fontSize: 14,
        padding: 5,
    },
    position: {
        position: 'relative',
        display: 'inline-block',
        backgroundColor: theme.palette.background.default,
        width: 50,
        height: 50,
        margin: '1px 5px',
        outline: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
    },
    legend: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: theme.palette.action.active,
    },
    selected: {
        outline: `3px solid ${theme.palette.primary.main}`,
    },
    topleft: {
        top: 8,
        left: 8,
    },
    topright: {
        top: 8,
        right: 8,
    },
    bottomleft: {
        bottom: 8,
        left: 8,
    },
    bottomright: {
        bottom: 8,
        right: 8,
    },
});

const LegendPosition = ({ position, onChange, classes }) => (
    <div className={classes.root}>
        <div className={classes.label}>{i18n.t('Legend position')}</div>
        {positions.map(pos => (
            <div
                key={pos}
                className={`${classes.position} ${
                    pos === position ? classes.selected : ''
                }`}
                onClick={pos !== position ? () => onChange(pos) : null}
            >
                <div className={`${classes.legend} ${classes[pos]}`} />
            </div>
        ))}
    </div>
);

LegendPosition.propTypes = {
    position: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LegendPosition);
