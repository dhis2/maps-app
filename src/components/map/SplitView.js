import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MapItem from './MapItem';

const styles = () => ({
    root: {
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'stretch',
    },
});

const SplitView = ({ basemap, basemaps, count, classes }) => {
    const items = [];

    // TODO: Cleaner way
    const basemapConfig = {
        ...basemaps.filter(b => b.id === basemap.id)[0],
        ...basemap,
    };

    for (let i = 0; i < count; i++) {
        items.push(<MapItem key={i} basemap={basemapConfig} />);
    }

    return <div className={classes.root}>{items}</div>;
};

SplitView.propTypes = {
    count: PropTypes.number.isRequired,
    basemap: PropTypes.object,
    basemaps: PropTypes.array,
    classes: PropTypes.object.isRequired,
};

export default connect(({ map, basemaps }) => ({
    basemap: map.basemap,
    basemaps,
}))(withStyles(styles)(SplitView));
