import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import Layer from './Layer';
import ThematicLayer from './ThematicLayer';

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
        controls: PropTypes.array,
        classes: PropTypes.object.isRequired,
        openContextMenu: PropTypes.func.isRequired,
    };

    // TODO: Remove
    static defaultProps = {
        openContextMenu: () => {},
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
        const { id, periods = [] } = layer;

        return (
            <div
                ref={node => (this.node = node)}
                className={`dhis2-map-split-view ${classes.root}`}
            >
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
                        <Layer index={0} {...basemap} />
                        <ThematicLayer
                            index={1}
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
    setMapControls = map => {
        const controls = {};

        this.props.controls.forEach(control => {
            map.addControl(control);
            controls[control.type] = map.getControlContainer(control.type);
        });

        this.setState(controls);
    };
}

export default withStyles(styles)(SplitView);
