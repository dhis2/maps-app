import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    container: {
        float: 'left',
        width: 120,
        marginRight: 16,
        cursor: 'pointer',
        boxSizing: 'border-box',
        height: 160,
    },

    image: {
        boxSizing: 'border-box',
        border: '1px solid #555',
        width: 120,
        height: 120,
    },

    noImage: {
        boxSizing: 'border-box',
        border: '1px solid #555',
        width: 120,
        height: 120,
        lineHeight: '120px',
        background: '#eee',
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 4,
    },

    name: {
        fontSize: 14,
        color: '#333',
        paddingBottom: 20,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

const Layer = ({ classes, layer, onClick }) => {
    const { img, type, name } = layer;

    return (
        <div className={classes.container} onClick={() => onClick(layer)}>
            {img ? (
                <img src={img} className={classes.image} />
            ) : (
                <div className={classes.noImage}>External layer</div>
            )}
            <div className={classes.name}>{name || type}</div>
        </div>
    );
};

Layer.propTypes = {
    classes: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(Layer);
