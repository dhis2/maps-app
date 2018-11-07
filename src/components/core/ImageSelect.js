import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    container: {}, // For container class override
    imageContainer: {
        position: 'relative',
        overflow: 'visible',
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: 'border-box',
        margin: 2,
    },
    imageContainerSelected: {
        margin: 0,
        border: `3px solid ${theme.palette.primary.main}`,
    },
    image: {
        width: '100%',
        display: 'block',
    },
    noImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: '#eee',
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 56,
    },
    title: {
        fontSize: 12,
        color: '#333',
        paddingTop: 6,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

const ImageSelect = ({
    classes,
    id,
    img,
    title,
    isSelected,
    onClick,
    style,
}) => (
    <div
        className={classes.container}
        title={title}
        onClick={() => onClick(id)}
        style={style}
    >
        <div
            className={`${classes.imageContainer} ${
                isSelected ? classes.imageContainerSelected : ''
            }`}
        >
            {img ? (
                <img src={img} className={classes.image} />
            ) : (
                <div className={classes.noImage} />
            )}
        </div>
        {title ? <div className={classes.title}>{title}</div> : null}
    </div>
);

ImageSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    title: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default withStyles(styles)(ImageSelect);
