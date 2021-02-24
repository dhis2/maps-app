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
        layer: PropTypes.object.isRequired,
        basemap: PropTypes.object,
        feature: PropTypes.object,
        controls: PropTypes.array,
        resizeOptions: PropTypes.object,
        openContextMenu: PropTypes.func.isRequired,
    };

    static defaultProps = {
        openContextMenu: () => {},
    };

    state = {
        controls: null,
    };

    // Add map controls to split view container
    componentDidUpdate(prevProps, prevState) {
        const { resizeOptions } = this.props;
        const { controls } = this.state;

        if (resizeOptions !== prevProps.resizeOptions) {
            this.onFullScreenChange(resizeOptions);
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
        } = this.props;
        const { resizeOptions } = this.state;

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
                        resizeOptions={resizeOptions}
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

    onFullScreenChange = ({ scrollZoom, fitBounds }) =>
        this.setState({ resizeOptions: { scrollZoom, fitBounds } });
}

export default SplitView;
