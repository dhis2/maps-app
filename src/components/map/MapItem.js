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
        setAttribution: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.map = mapApi({
            attributionControl: this.isLastMap() ? true : false,
        });
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        this.node.appendChild(this.map.getContainer());
        this.fitLayerBounds();
        this.map.sync(123); // TODO

        if (this.isLastMap()) {
            this.props.setAttribution(this.map.getAttribution());
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

    isLastMap = () => this.props.index === this.props.count - 1;
}

export default withStyles(styles)(MapItem);
