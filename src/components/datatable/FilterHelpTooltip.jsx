import { Popper, Portal } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles/FilterHelpTooltip.module.css'

const helpTooltipModifiers = [
    { name: 'offset', options: { offset: [0, 4] } },
    { name: 'flip', enabled: false },
]

const FilterHelpTooltip = ({
    content,
    placement,
    estimatedHeight,
    dataTest,
    children,
}) => {
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

    const referenceRect = referenceRef.current?.getBoundingClientRect()
    let spaceAvailable = Infinity
    if (referenceRect) {
        spaceAvailable =
            placement === 'top'
                ? referenceRect.top
                : window.innerHeight - referenceRect.bottom
    }
    const hasRoom = spaceAvailable >= estimatedHeight

    return (
        <span
            ref={referenceRef}
            onMouseOver={onOpen}
            onMouseOut={onClose}
            onFocus={onOpen}
            onBlur={onClose}
            data-test={`${dataTest}-reference`}
        >
            {children}
            {open && hasRoom && (
                <Portal>
                    <Popper
                        placement={placement}
                        reference={referenceRef}
                        modifiers={helpTooltipModifiers}
                    >
                        <div
                            className={styles.filterHelpTooltip}
                            data-test={`${dataTest}-content`}
                        >
                            {content}
                        </div>
                    </Popper>
                </Portal>
            )}
        </span>
    )
}

FilterHelpTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    dataTest: PropTypes.string.isRequired,
    estimatedHeight: PropTypes.number.isRequired,
    placement: PropTypes.oneOf(['top', 'bottom']).isRequired,
}

export default FilterHelpTooltip
