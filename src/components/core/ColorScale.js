import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import colorbrewer from '../../constants/colorbrewer';

const styles = {
    scale: {
        paddingLeft: 0,
        height: 36,
        cursor: 'pointer',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.12)',
        display: 'inline-block',
        whiteSpace: 'nowrap',
    },
    item: {
        marginLeft: 0,
        display: 'inline-block',
        height: '100%',
    },
};

// Returns one color scale based on a code and number of classes
const ColorScale = ({ scale, bins, width, style, onClick, classes }) => {
    const colors = colorbrewer[scale][bins];
    const itemWidth = width ? width / bins : 36;

    return (
        <ul
            className={classes.scale}
            style={{
                ...(width && { width }),
                ...style,
            }}
            onClick={event => onClick(event, scale)}
        >
            {colors.map((color, index) => (
                <li
                    key={index}
                    className={classes.item}
                    style={{ backgroundColor: color, width: itemWidth }}
                />
            ))}
        </ul>
    );
};

ColorScale.propTypes = {
    bins: PropTypes.number.isRequired,
    scale: PropTypes.string.isRequired,
    width: PropTypes.number,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ColorScale);
