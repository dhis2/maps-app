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
        '& .leaflet-control-attribution': {
            position: 'absolute',
            right: 2,
            bottom: 1,
            padding: 2,
            color: '#333',
            background: 'rgba(255, 255, 255, 0.7)',
            fontSize: 9,
            '& a': {
                color: '#333',
                textDecoration: 'none',
            },
        },
        '& .leaflet-control-zoom': {
            position: 'absolute',
            top: 10,
            right: 10,
            borderRadius: 0,
        },
    },
};

class SplitView extends PureComponent {
    static propTypes = {
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        classes: PropTypes.object.isRequired,
        openContextMenu: PropTypes.func.isRequired,
    };

    state = {
        attribution: null,
        zoom: null,
    };

    componentDidUpdate(prevProps, prevState) {
        const { attribution, zoom } = this.state;

        if (attribution && attribution !== prevState.attribution) {
            this.node.appendChild(attribution);
        }

        if (zoom && zoom !== prevState.zoom) {
            this.node.appendChild(zoom);
        }
    }

    render() {
        const { basemap, layer, classes, openContextMenu } = this.props;
        const { periods } = layer;

        return (
            <div ref={node => (this.node = node)} className={classes.root}>
                <MapName />
                {periods.map((period, index) => (
                    <MapItem
                        key={period.id}
                        index={index}
                        count={periods.length}
                        onAdd={this.onMapAdd}
                        onRemove={this.onMapRemove}
                        setMapControls={this.setMapControls}
                    >
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

    // Called from map child
    setMapControls = controls => this.setState(controls);
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
