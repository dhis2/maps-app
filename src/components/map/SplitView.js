import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import Layer from './Layer';
import ThematicLayer from './ThematicLayer';
import styles from './styles/SplitView.module.css';

class SplitView extends PureComponent {
    static propTypes = {
        isPlugin: PropTypes.bool,
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        controls: PropTypes.array,
        openContextMenu: PropTypes.func.isRequired,
    };

    // TODO: Remove
    static defaultProps = {
        openContextMenu: () => {},
    };

    state = {
        isFullscreen: false,
        controls: null,
    };

    // Add map controls to split view container
    componentDidUpdate(prevProps, prevState) {
        const { state, node } = this;

        if (state.controls !== prevState.controls) {
            Object.values(state.controls).forEach(control =>
                node.append(control)
            );
        }
    }

    render() {
        const { isPlugin, basemap, layer, openContextMenu } = this.props;

        const { isFullscreen } = this.state;

        const { id, periods = [] } = layer;

        return (
            <div
                ref={node => (this.node = node)}
                className={cx('dhis2-map-split-view', styles.splitView)}
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
                        isPlugin={isPlugin}
                        isFullscreen={isFullscreen}
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

        if (this.props.isPlugin) {
            map.on('fullscreenchange', this.onFullScreenChange);
        }

        this.setState({ controls });
    };

    onFullScreenChange = ({ isFullscreen }) => this.setState({ isFullscreen });
}

export default SplitView;
