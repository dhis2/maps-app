import { Popover } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment, useState, useRef } from 'react'
import {
    colorScales,
    getColorScale,
    getColorPalette,
} from '../../util/colors.js'
import ColorScale from './ColorScale.js'
import styles from './styles/ColorScaleSelect.module.css'

const ColorScaleSelect = ({ palette, width, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false)
    const anchorRef = useRef()

    const bins = palette.length
    const scale = getColorScale(palette)

    const onColorScaleSelect = (scale) => {
        onChange(getColorPalette(scale, bins))
        setIsOpen(false)
    }

    return (
        <Fragment>
            <div ref={anchorRef} className={cx(styles.colorScale, className)}>
                <ColorScale
                    bins={bins}
                    scale={scale}
                    onClick={() => setIsOpen(true)}
                    width={width || 260}
                />
            </div>
            {isOpen && (
                <Popover
                    reference={anchorRef}
                    arrow={false}
                    placement="right"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div
                        className={styles.popover}
                        style={{ width: width + 24 || 260 }}
                    >
                        {colorScales.map((scale, index) => (
                            <ColorScale
                                key={index}
                                scale={scale}
                                bins={bins}
                                onClick={onColorScaleSelect}
                                width={width || 260}
                            />
                        ))}
                    </div>
                </Popover>
            )}
        </Fragment>
    )
}

ColorScaleSelect.propTypes = {
    palette: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    width: PropTypes.number,
}

export default ColorScaleSelect
