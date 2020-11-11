import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Legend from '../legend/Legend';
import { legendPositions } from './LegendPosition';
import styles from './styles/DownloadLegend.module.css';

export const DownloadLegend = ({ position, layers, showName }) => {
    const legends = layers
        .filter(layer => layer.legend)
        .map(layer => layer.legend)
        .reverse();

    return (
        <div
            className={cx(styles.downloadLegend, styles[position], {
                [styles.name]: showName && position.substring(0, 3) === 'top',
            })}
        >
            {legends.map((legend, index) => (
                <div key={index} className={styles.legend}>
                    <h2 className={styles.title}>
                        {legend.title}
                        <span className={styles.period}>{legend.period}</span>
                    </h2>
                    <Legend {...legend} />
                </div>
            ))}
        </div>
    );
};

DownloadLegend.propTypes = {
    position: PropTypes.oneOf(legendPositions).isRequired,
    layers: PropTypes.array.isRequired,
    showName: PropTypes.bool.isRequired,
};

export default DownloadLegend;
