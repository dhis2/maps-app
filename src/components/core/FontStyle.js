import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { IconButton } from '@material-ui/core';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import NumberField from './NumberField';
import ColorPicker from './ColorPicker';
import { cssColor } from '../../util/colors';
import { LABEL_FONT_SIZE, LABEL_FONT_COLOR } from '../../constants/layers';
import styles from './styles/FontStyle.module.css';

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
}) => (
    <div className={styles.fontStyle} style={style}>
        {onSizeChange && (
            <NumberField
                label={i18n.t('Size')}
                value={parseInt(
                    size !== undefined ? size : LABEL_FONT_SIZE,
                    10
                )}
                onChange={value => onSizeChange(value + 'px')}
            />
        )}
        {onWeightChange && (
            <IconButton
                onClick={() =>
                    onWeightChange(weight === 'bold' ? 'normal' : 'bold')
                }
                className={styles.button}
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
                className={styles.button}
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
                width={32}
                height={32}
                onChange={onColorChange}
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
};

export default FontStyle;
