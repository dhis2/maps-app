import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import styles from './styles/MapName.module.css'

const MapName = ({ showName, name }) =>
    showName && name ? (
        <div className={styles.mapName}>
            <div className={`${styles.name} dhis2-maps-title`}>{name}</div>
        </div>
    ) : null

MapName.propTypes = {
    name: PropTypes.string,
    showName: PropTypes.bool,
}

export default connect(({ map, download }) => ({
    name: map.name,
    showName: download.showDialog ? download.showName : true,
}))(MapName)
