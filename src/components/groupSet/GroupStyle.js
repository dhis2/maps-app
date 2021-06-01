import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getInstance as getD2 } from 'd2';
import { ColorPicker } from '../core';
import styles from './styles/GroupStyle.module.css';

export const GroupStyle = ({ name, color, symbol, styleType, onChange }) => {
    const [imagePath, setImagePath] = useState();
    const useColor = styleType !== 'symbol';

    useEffect(() => {
        getD2().then(d2 =>
            setImagePath(
                `${d2.system.systemInfo.contextPath}/images/orgunitgroup/`
            )
        );
    }, []);

    return (
        <div className={styles.item}>
            {useColor ? (
                <ColorPicker
                    color={color}
                    onChange={onChange}
                    className={styles.color}
                />
            ) : (
                <span
                    className={styles.symbol}
                    style={{
                        backgroundImage:
                            imagePath && symbol
                                ? `url(${imagePath}${symbol})`
                                : 'none',
                    }}
                />
            )}
            <span className={styles.label}>{name}</span>
        </div>
    );
};

GroupStyle.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    styleType: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    symbol: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default GroupStyle;
