import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import InterpretationIcon from '../core/InterpretationIcon';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%b %d, %Y'); // TODO: Support different locales

const styles = theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        maxWidth: 'calc(100% - 100px)',
        top: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        zIndex: 999,
        fontSize: theme.typography.fontSize,
        '& > div': {
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: theme.shadows[1],
            borderRadius: theme.shape.borderRadius,
            margin: 8,
        },
    },
    name: {
        padding: '6px 8px',
        lineHeight: '17px',
    },
    interpretation: {
        position: 'relative',
        padding: '7px 8px 7px 28px',
        fontSize: 12,
        lineHeight: '15px',
    },
    interpretationIcon: {
        position: 'absolute',
        left: theme.spacing.unit,
        top: 7,
    },
});

const MapName = ({ name, interpretationDate, classes }) => (
    <div className={classes.root}>
        <div className={classes.name}>{name}</div>
        {interpretationDate && (
            <div className={classes.interpretation}>
                <div className={classes.interpretationIcon}>
                    <InterpretationIcon />
                </div>
                {i18n.t('Viewing interpretation from {{interpretationDate}}', {
                    interpretationDate: formatTime(
                        new Date(interpretationDate)
                    ),
                })}
            </div>
        )}
    </div>
);

MapName.propTypes = {
    name: PropTypes.string,
    interpretationDate: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapName);
