import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import mapApi from './MapApi';

const styles = () => ({
    item: {
        position: 'relative',
        boxSizing: 'border-box',
        width: '33.3333%',
        borderRight: '1px solid #aaa',
        borderBottom: '1px solid #aaa',
    },
});

class MapItem extends PureComponent {
    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    static propTypes = {
        index: PropTypes.number.isRequired,
        count: PropTypes.number.isRequired,
        children: PropTypes.node.isRequired,
        classes: PropTypes.object.isRequired,
        setMapControls: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.map = mapApi({
            attributionControl: false,
        });
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        const { index, setMapControls } = this.props;
        const { map } = this;

        this.node.appendChild(map.getContainer());
        this.fitLayerBounds();

        map.sync(123); // TODO

        // Add zoom and attribution if first map
        if (index == 0) {
            map.addControl({ type: 'zoom' });
            map.addControl({ type: 'attribution' });

            setMapControls({
                attribution: map.getAttribution(),
                zoom: map.getZoomControl(),
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.count !== prevProps.count) {
            this.fitLayerBounds();
        }
    }

    componentWillUnmount() {
        this.map.unsync(123); // TODO
        this.map.remove();
        delete this.map;
    }

    render() {
        const { children, classes } = this.props;

        return (
            <div ref={node => (this.node = node)} className={classes.item}>
                {children}
            </div>
        );
    }

    // Zoom to layers bounds on mount
    fitLayerBounds() {
        this.map.resize();

        const bounds = this.map.getLayersBounds();
        if (bounds) {
            this.map.fitBounds(bounds);
        }
    }
}

export default withStyles(styles)(MapItem);
