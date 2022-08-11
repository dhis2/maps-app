import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import Layer from './layers/Layer';
import ThematicLayer from './layers/ThematicLayer';
import styles from './styles/SplitView.module.css';

class SplitView extends PureComponent {
    static propTypes = {
        isPlugin: PropTypes.bool,
        isFullscreen: PropTypes.bool,
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        feature: PropTypes.object,
        controls: PropTypes.array,
        openContextMenu: PropTypes.func.isRequired,
        restoreCount: PropTypes.number,
    };

    static defaultProps = {
        openContextMenu: () => {},
    };

    state = {
        controls: null,
    };

    // Add map controls to split view container
    componentDidUpdate(prevProps, prevState) {
        const { isFullscreen, isPlugin } = this.props;
        const { controls } = this.state;

        // From map plugin resize method
        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            this.setState({ isFullscreen });
        }

        if (controls !== prevState.controls) {
            Object.values(controls).forEach(control =>
                this.node.append(control)
            );
        }
    }

    render() {
        const {
            isPlugin,
            basemap,
            layer,
            feature,
            openContextMenu,
            restoreCount,
        } = this.props;
        const { isFullscreen } = this.state;

        const { id, periods = [] } = layer;

        // console.log('isPlugin', isPlugin);

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
                        restoreCount={restoreCount}
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
                            feature={feature}
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

    // From built-in fullscreen control
    onFullScreenChange = ({ isFullscreen }) => this.setState({ isFullscreen });
}

export default SplitView;
