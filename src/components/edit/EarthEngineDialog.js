import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '../core/Tabs';
import Tab from '../core/Tab';
import TextField from '../core/TextField';
import ColorScaleSelect from '../core/ColorScaleSelect';
import Collection from '../earthengine/Collection';
import LegendItem from '../layers/legend/LegendItem';
import { setParams, setFilter, setPeriodName } from '../../actions/layerEdit';
import { getColorScale, getColorPalette } from '../../util/colors';
import { createLegend } from '../../loaders/earthEngineLoader';
import { layerDialogStyles } from './LayerDialogStyles';
import legendStyle from '../layers/legend/legendStyle';

const getDatasets = () => ({
    'WorldPop/POP': {
        // Population density
        description: i18n.t(
            "Population density estimates with national totals adjusted to match UN population division estimates. Try a different year if you don't see data for your country."
        ),
        collectionLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: i18n.t('Min people'),
        maxLabel: i18n.t('Max people'),
    },
    'USGS/SRTMGL1_003': {
        // Elevation
        description: i18n.t(
            'Elevation above sea-level. You can adjust the min and max values so it better representes the terrain in your region.'
        ),
        minValue: 0,
        maxValue: 8848,
        minLabel: i18n.t('Min meters'),
        maxLabel: i18n.t('Max meters'),
    },
    'UCSB-CHG/CHIRPS/PENTAD': {
        // Precipitation
        description: i18n.t(
            'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.'
        ),
        minValue: 0,
        maxValue: 100,
        minLabel: i18n.t('Min mm'),
        maxLabel: i18n.t('Max mm'),
    },
    'MODIS/006/MOD11A2': {
        // Temperature
        description: i18n.t(
            'Land surface temperatures collected from satellite in 8 days periods. Blank spots will appear in areas with a persistent cloud cover.'
        ),
        minValue: -100,
        maxValue: 100,
        minLabel: i18n.t('Min °C'),
        maxLabel: i18n.t('Max °C'),
    },
    'MODIS/006/MCD12Q1': {
        // Landcover
        description: i18n.t(
            'Distinct landcover types collected from satellites.'
        ),
        valueLabel: i18n.t('Select year'),
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': {
        // Nighttime lights
        description: i18n.t(
            'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.'
        ),
        valueLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: 63,
    },
});

const styles = {
    ...layerDialogStyles,
    flexFull: {
        ...layerDialogStyles.flexFull,
        marginBottom: 12,
    },
    legend: {
        ...legendStyle,
        marginLeft: 0,
    },
    legendTitle: {
        paddingBottom: 16,
        fontWeight: 'bold',
    },
    scale: {
        marginTop: 16,
    },
    error: {
        width: '100%',
        color: 'rgb(244, 67, 54)',
        fontSize: 12,
        lineHeight: '12px',
        marginLeft: 12,
    },
};

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
        classes: PropTypes.object.isRequired,
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
            classes,
        } = this.props;
        const dataset = getDatasets()[datasetId];
        const { tab, steps, filterError, rangeError, stepsError } = this.state;

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div className={classes.tabContent}>
                    <div className={classes.flexColumnFlow}>
                        <div className={classes.flexColumn}>
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
                                    className={classes.flexFull}
                                    errorText={filterError}
                                />
                            )}
                            {params && [
                                <div
                                    key="minmax"
                                    className={classes.flexInnerColumnFlow}
                                >
                                    <TextField
                                        type="number"
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
                                        className={classes.flexInnerColumn}
                                    />
                                    <TextField
                                        type="number"
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
                                        className={classes.flexInnerColumn}
                                    />
                                    <TextField
                                        type="number"
                                        label={i18n.t('Steps')}
                                        value={
                                            steps !== undefined
                                                ? steps
                                                : this.getStepsFromParams()
                                        }
                                        onChange={this.onStepsChange}
                                        className={classes.flexInnerColumn}
                                    />
                                </div>,
                                <div
                                    key="range_error"
                                    className={classes.error}
                                >
                                    {!this.isValidRange() && rangeError}
                                </div>,
                                <div
                                    key="steps_error"
                                    className={classes.error}
                                >
                                    {!this.isValidSteps() && stepsError}
                                </div>,
                                <div key="scale" className={classes.scale}>
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
                            <div className={classes.flexColumn}>
                                <div className={classes.legendTitle}>
                                    {i18n.t('Legend preview')}
                                </div>
                                <div className={classes.legend}>
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
        const dataset = getDatasets()[datasetId];
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
        const dataset = getDatasets()[datasetId];

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
    withRef: true,
})(withStyles(styles)(EarthEngineDialog));
