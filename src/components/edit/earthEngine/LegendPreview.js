import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import LegendItem from '../../legend/LegendItem';
import { createLegend } from '../../../loaders/earthEngineLoader';
import styles from '../styles/LayerDialog.module.css';

const paramsAreValid = ({ min, max }) =>
    !Number.isNaN(min) && !Number.isNaN(max) && max > min;

const LegendPreview = ({ params }) => {
    const legend = paramsAreValid(params) && createLegend(params);

    return legend ? (
        <div className={styles.flexColumn}>
            <div className={styles.legendTitle}>{i18n.t('Legend preview')}</div>
            <div className={styles.legend}>
                <table>
                    <tbody>
                        {legend.map((item, index) => (
                            <LegendItem {...item} key={`item-${index}`} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : null;
};

LegendPreview.propTypes = {
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
};

export default LegendPreview;
