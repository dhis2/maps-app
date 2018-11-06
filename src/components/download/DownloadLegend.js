import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Legend from '../layers/legend/Legend';

const styles = theme => ({
    root: {
        position: 'absolute',
        paddingTop: theme.spacing.unit,
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        zIndex: 998,
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: theme.shadows[1],
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        maxWidth: 220,
    },
    title: {
        fontSize: 15,
        fontWeight: 'normal',
        margin: 0,
        paddingBottom: 10,
    },
    period: {
        display: 'block',
    },
    topleft: {
        top: theme.spacing.unit,
        left: theme.spacing.unit,
    },
    topright: {
        top: theme.spacing.unit,
        right: theme.spacing.unit,
    },
    bottomleft: {
        bottom: 30,
        left: theme.spacing.unit,
    },
    bottomright: {
        bottom: 20,
        right: theme.spacing.unit,
    },
    name: {
        top: theme.spacing.unit * 6,
    },
});

export const DownloadLegend = ({ position, layers, showName, classes }) => {
    let className = `${classes.root} ${classes[position]}`;

    if (showName && position.substring(0, 3) === 'top') {
        className += ` ${classes.name}`;
    }

    const legends = layers
        .filter(layer => layer.legend)
        .map(layer => layer.legend);

    return (
        <div className={className}>
            {legends.map((legend, index) => (
                <div key={index}>
                    <h2 className={classes.title}>
                        {legend.title}
                        <span className={classes.period}>{legend.period}</span>
                    </h2>
                    <Legend {...legend} />
                </div>
            ))}
        </div>
    );
};

DownloadLegend.propTypes = {
    position: PropTypes.oneOf([
        'topleft',
        'topright',
        'bottomleft',
        'bottomright',
    ]).isRequired,
    layers: PropTypes.array.isRequired,
    showName: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DownloadLegend);
