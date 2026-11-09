import { Popper, Portal } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles/TopTooltip.module.css'

const topTooltipModifiers = [{ name: 'offset', options: { offset: [0, 4] } }]

const TopTooltip = ({ content, children }) => {
    const [open, setOpen] = useState(false)
    const referenceRef = useRef(null)
    const openTimerRef = useRef(null)
    const closeTimerRef = useRef(null)

    const onOpen = () => {
        clearTimeout(closeTimerRef.current)
        openTimerRef.current = setTimeout(() => setOpen(true), 200)
    }

    const onClose = () => {
        clearTimeout(openTimerRef.current)
        closeTimerRef.current = setTimeout(() => setOpen(false), 200)
    }

    useEffect(
        () => () => {
            clearTimeout(openTimerRef.current)
            clearTimeout(closeTimerRef.current)
        },
        []
    )

    return (
        <span
            ref={referenceRef}
            onMouseOver={onOpen}
            onMouseOut={onClose}
            onFocus={onOpen}
            onBlur={onClose}
        >
            {children}
            {open && (
                <Portal>
                    <Popper
                        placement="top"
                        reference={referenceRef}
                        modifiers={topTooltipModifiers}
                    >
                        <div className={styles.topTooltipContent}>
                            {content}
                        </div>
                    </Popper>
                </Portal>
            )}
        </span>
    )
}

TopTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
}

export default TopTooltip
