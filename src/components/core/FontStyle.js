import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import cx from 'classnames';
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
    className,
}) => (
    <div className={cx(styles.fontStyle, className)}>
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
            <div
                onClick={() =>
                    onWeightChange(weight === 'bold' ? 'normal' : 'bold')
                }
                className={cx(styles.button, {
                    [styles.selected]: weight === 'bold',
                })}
            >
                <BoldIcon />
            </div>
        )}
        {onStyleChange && (
            <div
                onClick={() =>
                    onStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
                }
                className={cx(styles.button, {
                    [styles.selected]: fontStyle === 'italic',
                })}
            >
                <ItalicIcon />
            </div>
        )}
        {onColorChange && (
            <ColorPicker
                color={cssColor(color) || LABEL_FONT_COLOR}
                width={32}
                height={32}
                onChange={onColorChange}
                className={styles.colorPicker}
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
    className: PropTypes.string,
};

export default FontStyle;
