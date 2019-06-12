import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MapItem from './MapItem';
import Layer from './Layer';
// import ThematicLayer from './ThematicLayer';

const styles = () => ({
    root: {
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'stretch',
    },
});

class SplitView extends PureComponent {
    static propTypes = {
        count: PropTypes.number.isRequired,
        basemap: PropTypes.object,
        basemaps: PropTypes.array,
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this._maps = [];
    }

    createMapItem(id, basemap) {
        return (
            <MapItem key={id} basemap={basemap} onCreate={this.onMapCreate}>
                <Layer key="basemap" {...basemap} />
            </MapItem>
        );
    }

    render() {
        const { basemap, basemaps, count, classes } = this.props;
        const items = [];

        // TODO: Cleaner way
        const basemapConfig = {
            ...basemaps.filter(b => b.id === basemap.id)[0],
            ...basemap,
        };

        for (let i = 0; i < count; i++) {
            items.push(this.createMapItem(i, basemapConfig));
        }

        return <div className={classes.root}>{items}</div>;
    }

    onMapCreate = map => {
        this._maps.push(map);

        if (this._maps.length === this.props.count) {
            this.synchronizeMaps();
        }
    };

    synchronizeMaps() {
        const maps = this._maps;
        const count = maps.length;
        let map;

        for (let x = 0; x < count; x++) {
            map = maps[x];
            for (let y = 0; y < count; y++) {
                if (y !== x) {
                    map.sync(maps[y]);
                }
            }
        }
    }
}

export default connect(({ map, basemaps }) => ({
    basemap: map.basemap,
    basemaps,
}))(withStyles(styles)(SplitView));
