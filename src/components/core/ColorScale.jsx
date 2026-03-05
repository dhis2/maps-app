import PropTypes from 'prop-types'
import React from 'react'
import colorbrewer from '../../constants/colorbrewer.js'
import styles from './styles/ColorScale.module.css'

// Returns one color scale based on a code and number of classes
const ColorScale = ({ scale, bins, width, onClick }) => {
    const colors = colorbrewer[scale][bins]
    const itemWidth = width ? width / bins : 36

    return (
        <ul
            data-test="color-scale"
            onClick={() => onClick(scale)}
            className={styles.colorScale}
            style={{
                ...(width && { width }),
            }}
        >
            {colors.map((color, index) => (
                <li
                    key={index}
                    className={styles.item}
                    style={{ backgroundColor: color, width: itemWidth }}
                />
            ))}
        </ul>
    )
}

ColorScale.propTypes = {
    bins: PropTypes.number.isRequired,
    scale: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    width: PropTypes.number,
}

export default ColorScale
