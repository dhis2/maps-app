import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MapItem from './MapItem';
import Layer from './Layer';
import ThematicLayer from './ThematicLayer';

const styles = theme => ({
    root: {
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'stretch',
    },
    period: {
        background: 'yellow',
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translate(-50%, 0)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: theme.shadows[1],
        borderRadius: theme.shape.borderRadius,
        padding: '4px 6px 3px',
        zIndex: 999,
    },
});

class SplitView extends PureComponent {
    static propTypes = {
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        basemaps: PropTypes.array,
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this._maps = [];
        this._mapCount = 0;
    }

    render() {
        const { basemap, basemaps, layer, classes } = this.props;
        const periods = Object.keys(layer.valuesByPeriod);

        this._mapCount = periods.length;

        // TODO: Cleaner way
        const basemapConfig = {
            ...basemaps.filter(b => b.id === basemap.id)[0],
            ...basemap,
        };

        return (
            <div className={classes.root}>
                {periods.map(period => (
                    <MapItem
                        key={period}
                        period={period}
                        basemap={basemap}
                        onCreate={this.onMapCreate}
                    >
                        <Layer key="basemap" {...basemapConfig} />
                        <ThematicLayer period={period} {...layer} />
                        <div className={classes.period}>{period}</div>
                    </MapItem>
                ))}
            </div>
        );
    }

    onMapCreate = map => {
        this._maps.push(map);

        if (this._maps.length === this._mapCount) {
            this.synchronizeMaps();
        }
    };

    synchronizeMaps() {
        const maps = this._maps;
        const count = this._mapCount;
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
