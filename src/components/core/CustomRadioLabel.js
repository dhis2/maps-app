import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/CustomRadioLabel.module.css'

const CustomRadioLabel = ({
    icon,
    label,
    sublabel,
    tooltip,
    checked,
    disabled,
}) => {
    const content = (
        <div
            className={cx(styles.customRadioLabel, {
                [styles.disabled]: disabled,
            })}
        >
            <div className={cx(styles.icon, { [styles.iconChecked]: checked })}>
                {icon}
            </div>
            <div className={styles.labelsWrap}>
                <div className={styles.label}>{label}</div>
                <div className={styles.sublabel}>{sublabel}</div>
            </div>
        </div>
    )

    return tooltip ? (
        <Tooltip content={tooltip} placement="top">
            {content}
        </Tooltip>
    ) : (
        content
    )
}

CustomRadioLabel.propTypes = {
    checked: PropTypes.bool.isRequired,
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    sublabel: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
}

export default CustomRadioLabel
