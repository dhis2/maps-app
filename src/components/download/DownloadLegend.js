import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Legend from '../layers/legend/Legend';

const positions = showName => ({
    topleft: {
        top: 8 + (showName ? 40 : 0),
        left: 8,
    },
    topright: {
        top: 8 + (showName ? 40 : 0),
        right: 8,
    },
    bottomleft: {
        bottom: 30,
        left: 8,
    },
    bottomright: {
        bottom: 20,
        right: 8,
    },
});

const styles = theme => ({
    root: {
        position: 'absolute',
        padding: '8px 8px 0 8px',
        zIndex: 998,
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: theme.shadows[1],
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
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
});

//
export const DownloadLegend = ({ position, layers, showName, classes }) => {
    const style = positions(showName)[position];

    const legends = layers
        .filter(layer => layer.legend)
        .map(layer => layer.legend);

    return (
        <div className={classes.root} style={style}>
            {legends.map((legend, index) => (
                <div key={index}>
                    <h2 className={classes.title}>
                        {legend.title}{' '}
                        <span className={classes.period}>{legend.period}</span>
                    </h2>
                    <Legend {...legend} />
                </div>
            ))}
        </div>
    );
};

DownloadLegend.propTypes = {
    position: PropTypes.string.isRequired,
    layers: PropTypes.array.isRequired,
    showName: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DownloadLegend);
