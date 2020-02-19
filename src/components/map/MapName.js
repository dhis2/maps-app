import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import InterpretationIcon from '../core/InterpretationIcon';
import { formatLocaleDate } from '../../util/time';

const styles = theme => ({
    root: {
        pointerEvents: 'none',
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
            margin: theme.spacing(1),
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
        left: theme.spacing(1),
        top: 7,
    },
});

const MapName = ({ showName, name, interpretationDate, uiLocale, classes }) =>
    showName && name ? (
        <div className={classes.root}>
            <div className={`${classes.name} dhis2-maps-title`}>{name}</div>
            {interpretationDate && (
                <div className={classes.interpretation}>
                    <div className={classes.interpretationIcon}>
                        <InterpretationIcon />
                    </div>
                    {i18n.t(
                        'Viewing interpretation from {{interpretationDate}}',
                        {
                            interpretationDate: formatLocaleDate(
                                interpretationDate,
                                uiLocale
                            ),
                        }
                    )}
                </div>
            )}
        </div>
    ) : null;

MapName.propTypes = {
    showName: PropTypes.bool,
    name: PropTypes.string,
    interpretationDate: PropTypes.string,
    uiLocale: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default connect(({ map, download, userSettings }) => ({
    name: map.name,
    interpretationDate: map.interpretationDate,
    showName: download.showDialog ? download.showName : true,
    uiLocale: userSettings.keyUiLocale,
}))(withStyles(styles)(MapName));
