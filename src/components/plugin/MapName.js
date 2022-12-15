import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/MapName.module.css'

const MapName = ({ name }) => (
    <div className={styles.mapName}>
        <div className={styles.name}>{name}</div>
    </div>
)

MapName.propTypes = {
    name: PropTypes.string,
}

export default MapName
