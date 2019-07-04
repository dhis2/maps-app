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

// TODO: These styles are leaflet specific - move to GIS API?
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

    // Add map controls to split view container
    componentDidUpdate(prevProps, prevState) {
        const { state, node } = this;

        if (state !== prevState) {
            Object.values(state).forEach(control => node.append(control));
        }
    }

    render() {
        const { basemap, layer, classes, openContextMenu } = this.props;
        const { id, periods } = layer;

        return (
            <div
                ref={node => (this.node = node)}
                className={`dhis2-map-split-view ${classes.root}`}
            >
                <MapName />
                {periods.map((period, index) => (
                    <MapItem
                        key={period.id}
                        index={index}
                        count={periods.length}
                        layerId={id}
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
