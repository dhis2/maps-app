import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MapName from './MapName';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import Layer from './Layer';
import ThematicLayer from './ThematicLayer';
import { openContextMenu } from '../../actions/map';

const styles = {
    root: {
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'stretch',
    },
};

class SplitView extends PureComponent {
    static propTypes = {
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        basemaps: PropTypes.array,
        classes: PropTypes.object.isRequired,
        openContextMenu: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this._maps = [];
        this._mapCount = 0;
    }

    render() {
        const {
            basemap,
            basemaps,
            layer,
            classes,
            openContextMenu,
        } = this.props;
        const { periods } = layer;
        this._mapCount = periods.length;

        // TODO: Cleaner way
        const basemapConfig = {
            ...basemaps.filter(b => b.id === basemap.id)[0],
            ...basemap,
        };

        return (
            <div className={classes.root}>
                <MapName />
                {periods.map(period => (
                    <MapItem
                        key={period.id}
                        basemap={basemap}
                        onCreate={this.onMapCreate}
                    >
                        <Layer key="basemap" {...basemapConfig} />
                        <ThematicLayer
                            period={period}
                            {...layer}
                            openContextMenu={openContextMenu}
                        />
                        <PeriodName period={period.name} />
                    </MapItem>
                ))}
            </div>
        );
    }

    onMapCreate = map => {
        this._maps.push(map);
        map.resize();

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

export default connect(
    ({ map, basemaps }) => ({
        basemap: map.basemap,
        basemaps,
    }),
    {
        openContextMenu,
    }
)(withStyles(styles)(SplitView));
