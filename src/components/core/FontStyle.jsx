import i18n from '@dhis2/d2-i18n'
import { Button, IconTextBold24, IconTextItalic24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    LABEL_FONT_SIZE,
    LABEL_FONT_SIZE_MIN,
    LABEL_FONT_SIZE_MAX,
    LABEL_FONT_COLOR,
} from '../../constants/layers.js'
import { cssColor } from '../../util/colors.js'
import ColorButton from './ColorButton.jsx'
import NumberField from './NumberField.jsx'
import styles from './styles/FontStyle.module.css'

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
                dense
                label={i18n.t('Size')}
                min={LABEL_FONT_SIZE_MIN}
                max={LABEL_FONT_SIZE_MAX}
                value={parseInt(
                    size !== undefined ? size : LABEL_FONT_SIZE,
                    10
                )}
                onChange={(value) => onSizeChange(value + 'px')}
                className={styles.textSize}
            />
        )}
        {onColorChange && (
            <ColorButton
                color={cssColor(color) || LABEL_FONT_COLOR}
                onChange={onColorChange}
                button={true}
            />
        )}
        {onWeightChange && (
            <Button
                icon={<IconTextBold24 />}
                onClick={() => {
                    onWeightChange(weight === 'bold' ? 'normal' : 'bold')
                }}
                secondary
                toggled={weight === 'bold'}
            />
        )}
        {onStyleChange && (
            <Button
                icon={<IconTextItalic24 />}
                onClick={() => {
                    onStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
                }}
                secondary
                toggled={fontStyle === 'italic'}
            />
        )}
    </div>
)

FontStyle.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    fontStyle: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    weight: PropTypes.string,
    onColorChange: PropTypes.func,
    onSizeChange: PropTypes.func,
    onStyleChange: PropTypes.func,
    onWeightChange: PropTypes.func,
}

export default FontStyle
