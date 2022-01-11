import React from 'react';
import PropTypes from 'prop-types';
import { getContrastColor } from '../../util/colors';
import styles from './styles/ColorCell.module.css';

const ColorCell = ({ cellData = '' }) => {
    const style = {
        backgroundColor: cellData,
        color: getContrastColor(cellData),
    };

    return (
        <div className={styles.colorCell} style={style}>
            {cellData.toLowerCase()}
        </div>
    );
};

ColorCell.propTypes = {
    cellData: PropTypes.string.isRequired,
};

export default ColorCell;
