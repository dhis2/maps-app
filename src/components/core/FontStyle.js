import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import TextField from './TextField';
import ColorPicker from './ColorPicker';
import { cssColor } from '../../util/colors';
import { LABEL_FONT_SIZE, LABEL_FONT_COLOR } from '../../constants/layers';

const itemSize = 30;

const styles = {
    sizeField: {
        width: 40,
        margin: '-6px 5px 0 0',
    },
    button: {
        background: '#fafafa',
        marginRight: 5,
        borderRadius: 0,
        width: itemSize,
        height: itemSize,
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
                label={i18n.t('Size')}
                value={parseInt(
                    size !== undefined ? size : LABEL_FONT_SIZE,
                    10
                )}
                onChange={value => onSizeChange(value + 'px')}
                className={classes.sizeField}
            />
        )}
        {onWeightChange && (
            <IconButton
                onClick={() =>
                    onWeightChange(weight === 'bold' ? 'normal' : 'bold')
                }
                className={classes.button}
                disableTouchRipple={true}
            >
                <BoldIcon htmlColor={weight === 'bold' ? '#333' : '#aaa'} />
            </IconButton>
        )}
        {onStyleChange && (
            <IconButton
                onClick={() =>
                    onStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
                }
                className={classes.button}
                disableTouchRipple={true}
            >
                <ItalicIcon
                    htmlColor={fontStyle === 'italic' ? '#333' : '#aaa'}
                />
            </IconButton>
        )}
        {onColorChange && (
            <ColorPicker
                color={cssColor(color) || LABEL_FONT_COLOR}
                width={itemSize}
                height={itemSize}
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
