import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getInstance as getD2 } from 'd2';
import styles from './styles/GroupStyle.module.css';

export const GroupStyle = ({ name, color, symbol, styleType }) => {
    const [imagePath, setImagePath] = useState();
    const useColor = styleType !== 'SYMBOL';

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
                <span
                    className={styles.color}
                    style={{
                        backgroundColor: color,
                    }}
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
};

export default GroupStyle;
