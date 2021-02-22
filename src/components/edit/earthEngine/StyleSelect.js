import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import NumberField from '../../core/NumberField';
import ColorScaleSelect from '../../core/ColorScaleSelect';
import LegendItem from '../../legend/LegendItem';
import BufferRadius from '../shared/BufferRadius';
import { getColorScale, getColorPalette } from '../../../util/colors';
import { createLegend } from '../../../loaders/earthEngineLoader';
import { setParams } from '../../../actions/layerEdit';
import { EE_BUFFER } from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

const getStepsFromParams = ({ palette, min }) =>
    palette.split(',').length - (min === 0 ? 1 : 2);

const isValidSteps = (newSteps, params) => {
    const steps =
        newSteps !== undefined ? newSteps : getStepsFromParams(params);
    return steps > 0 && steps < 8; // Valid steps: 1-7
};

const StyleSelect = ({ unit, params, setParams }) => {
    const [steps, setSteps] = useState();
    const { min, max, palette } = params;

    const onStepsChange = useCallback(
        newSteps => {
            const steps = newSteps === '' ? '' : parseInt(newSteps, 10);

            if (isValidSteps(steps, params)) {
                const { min, max, palette } = params;
                const scale = getColorScale(palette);
                const classes =
                    (steps == 1 && min == 0 ? 2 : steps) + (min == 0 ? 1 : 2);
                const newPalette = getColorPalette(scale, classes);

                if (newPalette) {
                    setParams(min, max, newPalette);
                }

                setSteps(steps);
            }
        },
        [params, setParams]
    );

    return (
        <div className={styles.flexColumnFlow}>
            <div className={styles.flexColumn}>
                <p>{i18n.t('Unit: {{ unit }}', { unit })}</p>
                <div key="minmax" className={styles.flexInnerColumnFlow}>
                    <NumberField
                        label={i18n.t('Min')}
                        value={min}
                        onChange={min =>
                            setParams(parseInt(min), parseInt(max), palette)
                        }
                        className={styles.flexInnerColumn}
                    />{' '}
                    <NumberField
                        label={i18n.t('Max')}
                        value={params.max}
                        onChange={max =>
                            setParams(parseInt(min), parseInt(max), palette)
                        }
                        className={styles.flexInnerColumn}
                    />{' '}
                    <NumberField
                        label={i18n.t('Steps')}
                        value={
                            steps !== undefined
                                ? steps
                                : getStepsFromParams(params)
                        }
                        onChange={onStepsChange}
                        className={styles.flexInnerColumn}
                    />
                    <div className={styles.scale}>
                        <ColorScaleSelect
                            palette={params.palette}
                            onChange={palette => setParams(min, max, palette)}
                            width={260}
                        />
                    </div>
                </div>
                <BufferRadius defaultRadius={EE_BUFFER} />
            </div>
            <div className={styles.flexColumn}>
                <div className={styles.legendTitle}>
                    {i18n.t('Legend preview')}
                </div>
                <div className={styles.legend}>
                    <table>
                        <tbody>
                            {createLegend(params).map((item, index) => (
                                <LegendItem {...item} key={`item-${index}`} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

StyleSelect.propTypes = {
    unit: PropTypes.string.isRequired,
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
    setParams: PropTypes.func.isRequired,
};

export default connect(null, {
    setParams,
})(StyleSelect);
