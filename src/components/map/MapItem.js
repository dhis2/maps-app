import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import D2map from '@dhis2/gis-api';
import Layer from './Layer';

const styles = () => ({
    item: {
        boxSizing: 'border-box',
        width: '33.3333%',
        borderRight: '1px solid #aaa',
        borderBottom: '1px solid #aaa',
    },
});

class MapItem extends Component {
    static contextTypes = {
        map: PropTypes.object,
        basemap: PropTypes.object,
    };

    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    static propTypes = {
        basemap: PropTypes.object,
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);

        // Create map div
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';

        this.map = new D2map(div);
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        this.node.appendChild(this.map.getContainer());
        this.map.setView([-11.8, 8.5], 6);
    }

    render() {
        const { basemap, classes } = this.props;

        return (
            <div ref={node => (this.node = node)} className={classes.item}>
                <Layer key="basemap" {...basemap} />
            </div>
        );
    }
}

export default withStyles(styles)(MapItem);
