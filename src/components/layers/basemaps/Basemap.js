import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    container: {
        float: 'left',
        width: 120,
        marginLeft: 12,
        cursor: 'pointer',
        boxSizing: 'border-box',
        height: 90,
    },
    imageContainer: {
        position: 'relative',
        height: 56,
        width: '100%',
        marginTop: 4,
        overflow: 'hidden',
    },
    image: {
        position: 'absolute',
        clip: 'rect(64px, 256px, 192px, 0)',
        width: '100%',
        top: -64,
    },
    noImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: '#eee',
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: '56px',
    },
    name: {
        fontSize: 12,
        color: '#333',
        paddingTop: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

const Basemap = ({ classes, id, img, name, isSelected, onClick }) => {
    const borderStyle = {
        outline: isSelected ? '3px solid orange' : '1px solid #999',
    };

    return (
        <div
            className={classes.container}
            title={name}
            onClick={() => onClick(id)}
        >
            <div className={classes.imageContainer} style={borderStyle}>
                {img ? (
                    <img src={img} className={classes.image} />
                ) : (
                    <div className={classes.noImage}>External basemap</div>
                )}
            </div>
            <div className={classes.name}>{name}</div>
        </div>
    );
};

Basemap.propTypes = {
    classes: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    name: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

Basemap.defaultProps = {
    title: '',
};

export default withStyles(styles)(Basemap);
