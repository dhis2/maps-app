import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import NumberField from '../core/NumberField';
import ColorScaleSelect from '../core/ColorScaleSelect';
import Collection from '../earthengine/Collection';
import LegendItem from '../legend/LegendItem';
import { setParams, setFilter, setPeriodName } from '../../actions/layerEdit';
import { getColorScale, getColorPalette } from '../../util/colors';
import { createLegend } from '../../loaders/earthEngineLoader';
import { getEarthEngineLayer } from '../../util/earthEngine';
import styles from './styles/LayerDialog.module.css';

class EarthEngineDialog extends Component {
    static propTypes = {
        datasetId: PropTypes.string.isRequired,
        filter: PropTypes.array,
        params: PropTypes.shape({
            min: PropTypes.number.isRequired,
            max: PropTypes.number.isRequired,
            palette: PropTypes.string.isRequired,
        }),
        setFilter: PropTypes.func.isRequired,
        setParams: PropTypes.func.isRequired,
        setPeriodName: PropTypes.func.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    state = {
        tab: 'style',
    };

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props;

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
        }
    }

    // Steps are less as we also have colors for above and below (not below if min = 0)
    getStepsFromParams() {
        const { palette, min } = this.props.params;
        return palette.split(',').length - (min === 0 ? 1 : 2);
    }

    // Always set state to update text field, but only store if valid
    onStepsChange = newSteps => {
        const { min, max, palette } = this.props.params;
        const steps = newSteps === '' ? '' : parseInt(newSteps, 10);

        this.setState({ steps });

        if (this.isValidSteps(steps)) {
            const scale = getColorScale(palette);
            const classes =
                (steps == 1 && min == 0 ? 2 : steps) + (min == 0 ? 1 : 2);
            const newPalette = getColorPalette(scale, classes);

            if (newPalette) {
                this.props.setParams(min, max, newPalette);
            }
        }
    };

    // TODO: Create a d2-ui number field that returns numbers (not text) and controls min and max
    render() {
        const {
            datasetId,
            params,
            filter,
            setParams,
            setFilter,
            setPeriodName,
        } = this.props;

        const dataset = getEarthEngineLayer(datasetId);
        const { steps, filterError, rangeError, stepsError } = this.state;

        return (
            <div>
                <div className={styles.tabContent}>
                    <div className={styles.flexColumnFlow}>
                        <div className={styles.flexColumn}>
                            <div>{dataset.description}</div>
                            {datasetId !== 'USGS/SRTMGL1_003' && ( // If not elevation
                                <Collection
                                    label={dataset.collectionLabel}
                                    id={datasetId}
                                    filter={filter}
                                    onChange={(periodName, filter) => {
                                        setPeriodName(periodName);
                                        setFilter(filter);
                                    }}
                                    className={styles.flexFull}
                                    errorText={filterError}
                                />
                            )}
                            {params && [
                                <div
                                    key="minmax"
                                    className={styles.flexInnerColumnFlow}
                                >
                                    <NumberField
                                        label={
                                            dataset.minLabel || i18n.t('Min')
                                        }
                                        value={params.min}
                                        onChange={min =>
                                            setParams(
                                                parseInt(min),
                                                parseInt(params.max),
                                                params.palette
                                            )
                                        }
                                        className={styles.flexInnerColumn}
                                    />
                                    <NumberField
                                        label={
                                            dataset.maxLabel || i18n.t('Max')
                                        }
                                        value={params.max}
                                        onChange={max =>
                                            setParams(
                                                parseInt(params.min),
                                                parseInt(max),
                                                params.palette
                                            )
                                        }
                                        className={styles.flexInnerColumn}
                                    />
                                    <NumberField
                                        label={i18n.t('Steps')}
                                        value={
                                            steps !== undefined
                                                ? steps
                                                : this.getStepsFromParams()
                                        }
                                        onChange={this.onStepsChange}
                                        className={styles.flexInnerColumn}
                                    />
                                </div>,
                                <div
                                    key="range_error"
                                    className={styles.eeError}
                                >
                                    {!this.isValidRange() && rangeError}
                                </div>,
                                <div
                                    key="steps_error"
                                    className={styles.eeError}
                                >
                                    {!this.isValidSteps() && stepsError}
                                </div>,
                                <div key="scale" className={styles.scale}>
                                    <ColorScaleSelect
                                        palette={params.palette}
                                        onChange={palette =>
                                            setParams(
                                                params.min,
                                                params.max,
                                                palette
                                            )
                                        }
                                        width={260}
                                    />
                                </div>,
                            ]}
                        </div>

                        {params && (
                            <div className={styles.flexColumn}>
                                <div className={styles.legendTitle}>
                                    {i18n.t('Legend preview')}
                                </div>
                                <div className={styles.legend}>
                                    <table>
                                        <tbody>
                                            {createLegend(params).map(
                                                (item, index) => (
                                                    <LegendItem
                                                        {...item}
                                                        key={`item-${index}`}
                                                    />
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        });

        return false;
    }

    isValidRange() {
        const { datasetId, params } = this.props;
        const dataset = getEarthEngineLayer(datasetId);
        const { min, max } = params;
        const { minValue, maxValue } = dataset;

        return (
            min < max &&
            min >= minValue &&
            min <= maxValue &&
            max >= minValue &&
            max <= maxValue
        );
    }

    isValidSteps(newSteps) {
        const steps =
            newSteps !== undefined ? newSteps : this.getStepsFromParams();
        return steps > 0 && steps < 8; // Valid steps: 1-7
    }

    validate() {
        const { datasetId, filter, params } = this.props;
        const dataset = getEarthEngineLayer(datasetId);

        if (datasetId !== 'USGS/SRTMGL1_003' && !filter) {
            return this.setErrorState(
                'filterError',
                i18n.t('This field is required'),
                'style'
            );
        }

        if (params) {
            const { minValue, maxValue } = dataset;

            // TODO: This should be implemented in the number fields directly
            if (!this.isValidRange()) {
                return this.setErrorState(
                    'rangeError',
                    `${i18n.t('Valid range is')} ${minValue} - ${maxValue}`,
                    'style'
                );
            }
        }

        return true;
    }
}

export default connect(null, { setParams, setFilter, setPeriodName }, null, {
    forwardRef: true,
})(EarthEngineDialog);
