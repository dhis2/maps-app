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
        classes: PropTypes.object.isRequired,
        openContextMenu: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this._maps = [];
        this._mapCount = 0;
    }

    // Unsync the maps (remove event handlers)
    componentWillUnmount() {
        this.syncEachMap(true); // true to unsync
    }

    render() {
        const { basemap, layer, classes, openContextMenu } = this.props;
        const { periods } = layer;
        this._mapCount = periods.length;

        return (
            <div className={classes.root}>
                <MapName />
                {periods.map(period => (
                    <MapItem key={period.id} onCreate={this.onMapCreate}>
                        <Layer {...basemap} />
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

    // Called when each map is created
    onMapCreate = map => {
        this._maps.push(map);
        map.resize();

        // Sync maps when all are created
        if (this._maps.length === this._mapCount) {
            this.syncEachMap();
        }
    };

    // Sync all maps (both ways)
    syncEachMap(unsync) {
        const maps = this._maps;
        for (let x = 0; x < maps.length; x++) {
            for (let y = 0; y < maps.length; y++) {
                // Don't sync with itself
                if (y !== x) {
                    maps[x][unsync ? 'unsync' : 'sync'](maps[y]);
                }
            }
        }
    }
}

export default connect(
    ({ map, basemaps }) => ({
        basemap: {
            ...basemaps.filter(b => b.id === map.basemap.id)[0],
            ...map.basemap,
        },
    }),
    {
        openContextMenu,
    }
)(withStyles(styles)(SplitView));
