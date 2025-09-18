import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/MenuButton.module.css'

/* Copied from https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/components/MenuButton/MenuButton.js */
const MenuButton = ({
    children,
    dataTest,
    disabled,
    name,
    onBlur,
    onClick,
    onFocus,
}) => (
    <button
        className={styles.menuButton}
        data-test={dataTest}
        disabled={disabled}
        name={name}
        onBlur={onBlur}
        onClick={onClick}
        onFocus={onFocus}
    >
        {children}
    </button>
)

MenuButton.propTypes = {
    children: PropTypes.node,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
}

export default MenuButton
