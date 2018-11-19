import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import TextField from './TextField';
import ColorPicker from './ColorPicker';

const styles = {
    sizeField: {
        width: 48,
        marginRight: 5,
    },
    button: {
        background: '#fafafa',
        marginRight: 5,
        borderRadius: 0,
    },
    buttonPressed: {
        background: '#555',
        marginRight: 5,
        borderRadius: 0,
    },
    color: {
        display: 'inline-block',
    },
};

const FontStyle = ({
    color,
    size,
    weight,
    fontStyle,
    onColorChange,
    onSizeChange,
    onWeightChange,
    onStyleChange,
    style,
    classes,
}) => (
    <div style={style}>
        {onSizeChange && (
            <TextField
                id="size"
                type="number"
                label="Size"
                value={size !== undefined ? parseInt(size, 10) : 11}
                onChange={onSizeChange}
                style={styles.sizeField}
            />
        )}
        {onWeightChange && (
            <IconButton
                onClick={() =>
                    onWeightChange(weight === 'bold' ? 'normal' : 'bold')
                }
                style={weight === 'bold' ? styles.buttonPressed : styles.button}
                disableTouchRipple={true}
            >
                <BoldIcon nativeColor={weight === 'bold' ? '#fff' : '#555'} />
            </IconButton>
        )}
        {onStyleChange && (
            <IconButton
                onClick={() =>
                    onStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
                }
                style={
                    fontStyle === 'italic'
                        ? styles.buttonPressed
                        : styles.button
                }
                disableTouchRipple={true}
            >
                <ItalicIcon
                    nativeColor={fontStyle === 'italic' ? '#fff' : '#555'}
                />
            </IconButton>
        )}
        {onColorChange && (
            <ColorPicker
                color={color || '#333333'}
                width={48}
                height={48}
                onChange={onColorChange}
                style={styles.color}
            />
        )}
    </div>
);

FontStyle.propTypes = {
    color: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    weight: PropTypes.string,
    fontStyle: PropTypes.string,
    onColorChange: PropTypes.func,
    onSizeChange: PropTypes.func,
    onWeightChange: PropTypes.func,
    onStyleChange: PropTypes.func,
    style: PropTypes.object,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FontStyle);
