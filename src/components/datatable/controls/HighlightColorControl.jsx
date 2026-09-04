import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import ColorPicker from '../../core/ColorPicker.jsx'
import styles from './styles/HighlightColorControl.module.css'

const HighlightColorControl = ({ color, onChange }) => (
    <span className={styles.wrapper}>
        <Tooltip content={i18n.t('Highlight color')} placement="top">
            <ColorPicker
                className={styles.colorPicker}
                color={color}
                width={16}
                height={16}
                centerIcon
                onChange={onChange}
            />
        </Tooltip>
    </span>
)

HighlightColorControl.propTypes = {
    onChange: PropTypes.func.isRequired,
    color: PropTypes.string,
}

export default HighlightColorControl
