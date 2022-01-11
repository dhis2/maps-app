import React from 'react';
import PropTypes from 'prop-types';
import { AlertBar } from '@dhis2/ui';
import styles from './styles/Alert.module.css';

const Alert = ({ message, onHidden }) => (
    <div className={styles.alert}>
        <AlertBar critical={true} duration={10000} onHidden={onHidden}>
            {message}
        </AlertBar>
    </div>
);

Alert.propTypes = {
    message: PropTypes.string.isRequired,
    onHidden: PropTypes.func.isRequired,
};

export default Alert;
