import PropTypes from 'prop-types'
import React, { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getCssVar } from '../../../util/helpers.js'
import styles from './styles/ActiveLayerControl.module.css'

const ActiveLayerControl = ({ name }) => {
    const nameRef = useRef(null)
    const [nameTooltipPos, setNameTooltipPos] = useState(null)

    const onMouseEnter = useCallback(() => {
        const el = nameRef.current
        if (!el || el.scrollWidth <= el.offsetWidth) {
            return
        }
        const rect = el.getBoundingClientRect()
        const computed = getComputedStyle(el)
        const lineHeight = Number.parseFloat(computed.lineHeight)
        const verticalPadding = getCssVar(
            '--data-table-name-tooltip-vertical-padding'
        )
        setNameTooltipPos({
            top: rect.top + (rect.height - lineHeight) / 2 - verticalPadding,
            left: rect.left,
            color: computed.color,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: `${lineHeight}px`,
            paddingLeft: computed.paddingLeft,
        })
    }, [])

    const onMouseLeave = useCallback(() => setNameTooltipPos(null), [])

    return (
        <>
            <span
                ref={nameRef}
                className={styles.layerName}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {name}
            </span>
            {nameTooltipPos &&
                createPortal(
                    <div
                        className={styles.nameTooltip}
                        style={{
                            top: nameTooltipPos.top,
                            left: nameTooltipPos.left,
                            color: nameTooltipPos.color,
                            fontSize: nameTooltipPos.fontSize,
                            fontWeight: nameTooltipPos.fontWeight,
                            lineHeight: nameTooltipPos.lineHeight,
                            paddingLeft: nameTooltipPos.paddingLeft,
                        }}
                    >
                        {name}
                    </div>,
                    document.body
                )}
        </>
    )
}

ActiveLayerControl.propTypes = {
    name: PropTypes.string,
}

export default ActiveLayerControl
