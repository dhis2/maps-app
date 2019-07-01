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
        children: PropTypes.node.isRequired,
        onCreate: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.map = mapApi();
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        this.node.appendChild(this.map.getContainer());
        this.map.resize();

        // Zoom to layers bounds on mount
        const bounds = this.map.getLayersBounds();
        if (bounds) {
            this.map.fitBounds(bounds);
        }

        // Sync map
        this.props.onCreate(this.map);
    }

    componentWillUnmount() {
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
}

export default withStyles(styles)(MapItem);
