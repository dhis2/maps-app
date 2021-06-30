import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/OrgUnitInfo.module.css';

const OrgUnitInfo = ({
    // id,
    // code,
    name,
    // shortName,
    // openingDate,
    // longitude,
    // latitude,
}) => {
    return (
        <div className={styles.info}>
            <h3>{name}</h3>
        </div>
    );
};

OrgUnitInfo.propTypes = {
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    openingDate: PropTypes.string.isRequired,
    longitude: PropTypes.number,
    latitude: PropTypes.number,
};

export default OrgUnitInfo;
