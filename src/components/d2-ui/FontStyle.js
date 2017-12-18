import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import BoldIcon from 'material-ui/svg-icons/editor/format-bold';
import ItalicIcon from 'material-ui/svg-icons/editor/format-italic';
import TextField from 'd2-ui/lib/text-field/TextField';
import ColorPicker from './ColorPicker';

const styles = {
    sizeField: {
        width: 48,
        marginRight: 5,
    },
    button: {
        background: '#fafafa',
        marginRight: 5,
    },
    buttonPressed: {
        background: '#555',
        marginRight: 5,
    }
};

const FontStyle = ({ color, size, weight, fontStyle, onColorChange, onSizeChange, onWeightChange, onStyleChange, style }) => (
    <div style={style}>
        {onSizeChange &&
            <TextField
                type='number'
                label='Size'
                value={size !== undefined ? size : 11}
                onChange={onSizeChange}
                style={styles.sizeField}
            />
        }
        {onWeightChange &&
            <IconButton
                onClick={() => onWeightChange(weight === 'bold' ? 'normal' : 'bold')}
                style={weight === 'bold' ? styles.buttonPressed : styles.button}
                disableTouchRipple={true}
            >
                <BoldIcon
                    color={weight === 'bold' ? '#fff' : '#555'}
                />
            </IconButton>
        }
        {onStyleChange &&
            <IconButton
                onClick={() => onStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
                style={fontStyle === 'italic' ? styles.buttonPressed : styles.button}
                disableTouchRipple={true}>
                <ItalicIcon
                    color={fontStyle === 'italic' ? '#fff' : '#555'}
                />
            </IconButton>
        }
        {onColorChange &&
            <ColorPicker
                color={color || '#333333'}
                onChange={onColorChange}
            />
        }
    </div>
);


FontStyle.propTypes = {

};

export default FontStyle;
