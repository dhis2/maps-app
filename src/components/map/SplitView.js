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
            right: 0,
            bottom: 0,
            padding: 2,
            color: '#333',
            background: 'rgba(255, 255, 255, 0.7)',
            fontSize: 9,
            '& a': {
                color: '#333',
                textDecoration: 'none',
            },
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
    };

    componentDidUpdate(prevProps, prevState) {
        const { attribution } = this.state;

        if (attribution !== prevState.attribution) {
            this.node.appendChild(attribution);
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
                        setAttribution={this.setAttribution}
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
    setAttribution = attribution => this.setState({ attribution });
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
