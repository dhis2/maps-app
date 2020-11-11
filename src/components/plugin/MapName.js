import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/MapName.module.css';

const MapName = ({ name }) => (
    <div className={styles.mapName}>
        <div>{name}</div>
    </div>
);

MapName.propTypes = {
    name: PropTypes.string,
};

export default MapName;
