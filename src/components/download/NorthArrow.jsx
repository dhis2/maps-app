import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import styles from './styles/NorthArrow.module.css'

const NorthArrow = ({
    map,
    downloadMapInfoOpen,
    width = 90,
    height = 90,
    northLetter = 'N',
}) => {
    const [rotation, setRotation] = useState(map.getBearing())
    const position = useSelector((state) => state.download.northArrowPosition)
    const basemap = useSelector((state) => state.map.basemap)
    const { isDark } = useBasemapConfig(basemap)
    const color = isDark ? 'white' : 'black'

    const onMapRotate = useCallback((evt) => {
        setRotation(-evt.target.getBearing())
    }, [])

    useEffect(() => {
        map.on('rotate', onMapRotate)
        return () => {
            map.on('rotate', onMapRotate)
        }
    }, [map, onMapRotate])

    return (
        <div
            className={cx(styles.northArrow, styles[position], {
                [styles.downloadMapInfoOpen]: downloadMapInfoOpen,
            })}
            data-test="north-arrow"
        >
            <svg
                width={width}
                height={height}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="2" />
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="central"
                    textAnchor="middle"
                    fill={color}
                >
                    {northLetter}
                </text>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24.4472 0.776393C24.3625 0.607001 24.1893 0.5 23.9999 0.5C23.8106 0.5 23.6374 0.607001 23.5527 0.776393L16.2178 15.4463C16.1098 15.6623 16.5106 15.9397 16.691 15.7792C18.6342 14.0503 21.1944 13 24 13C26.8055 13 29.3657 14.0503 31.3089 15.7792C31.4893 15.9396 31.8901 15.6623 31.7821 15.4463L24.4472 0.776393Z"
                    fill={color}
                    transform={`rotate(${rotation}, 24, 24)`}
                />
            </svg>
        </div>
    )
}

NorthArrow.propTypes = {
    downloadMapInfoOpen: PropTypes.bool.isRequired,
    map: PropTypes.object.isRequired,
    height: PropTypes.number,
    northLetter: PropTypes.string,
    width: PropTypes.number,
}

export default NorthArrow
