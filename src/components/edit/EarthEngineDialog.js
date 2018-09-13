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
import { setParams, setFilter } from '../../actions/layerEdit';
import { getColorScale, getColorPalette } from '../../util/colorscale';
import { createLegend } from '../../loaders/earthEngineLoader';
import { layerDialogStyles } from './LayerDialogStyles';
import '../layers/legend/Legend.css';

const datasets = {
    'WorldPop/POP': {
        // Population density
        description:
            "Population density estimates with national totals adjusted to match UN population division estimates. Try a different year if you don't see data for your country.",
        collectionLabel: 'Select year',
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: 'Min people',
        maxLabel: 'Max people',
    },
    'USGS/SRTMGL1_003': {
        // Elevation
        description:
            'Elevation above sea-level. You can adjust the min and max values so it better representes the terrain in your region.',
        minValue: 0,
        maxValue: 8848,
        minLabel: 'Min meters',
        maxLabel: 'Max meters',
    },
    'UCSB-CHG/CHIRPS/PENTAD': {
        // Precipitation
        description:
            'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.',
        minValue: 0,
        maxValue: 100,
        minLabel: 'Min mm',
        maxLabel: 'Max mm',
    },
    'MODIS/MOD11A2': {
        // Temperature
        description:
            'Land surface temperatures collected from satellite in 8 days periods. Blank spots will appear in areas with a persistent cloud cover.',
        minValue: -100,
        maxValue: 100,
        minLabel: 'Min °C',
        maxLabel: 'Max °C',
    },
    'MODIS/051/MCD12Q1': {
        // Landcover
        description: '17 distinct landcover types collected from satellites.',
        valueLabel: 'Select year',
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': {
        // Nighttime lights
        description:
            'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.',
        valueLabel: 'Select year',
        minValue: 0,
        maxValue: 63,
    },
};

const styles = {
    ...layerDialogStyles,
    legend: {
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    legendTitle: {
        paddingBottom: 16,
        fontWeight: 'bold',
    },
    colorScale: {
        marginLeft: 12,
        maxWidth: 270,
        overflow: 'hidden',
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
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'style',
        };
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
            classes,
        } = this.props;
        const dataset = datasets[datasetId];
        const { tab, steps, filterError, rangeError, stepsError } = this.state;

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div className={classes.tabContent}>
                    <div style={styles.flexColumnFlow}>
                        <div style={styles.flexColumn}>
                            <div>{dataset.description}</div>
                            {datasetId !== 'USGS/SRTMGL1_003' && ( // If not elevation
                                <Collection
                                    label={i18n.t(dataset.collectionLabel)}
                                    id={datasetId}
                                    filter={filter}
                                    onChange={setFilter}
                                    style={{
                                        ...styles.flexFull,
                                        marginBottom: 12,
                                    }}
                                    errorText={filterError}
                                />
                            )}
                            {params && [
                                <div
                                    key="minmax"
                                    style={styles.flexInnerColumnFlow}
                                >
                                    <TextField
                                        type="number"
                                        label={i18n.t(
                                            dataset.minLabel || 'Min'
                                        )}
                                        value={params.min}
                                        onChange={min =>
                                            setParams(
                                                parseInt(min),
                                                parseInt(params.max),
                                                params.palette
                                            )
                                        }
                                        style={styles.flexInnerColumn}
                                    />
                                    <TextField
                                        type="number"
                                        label={i18n.t(
                                            dataset.maxLabel || 'Max'
                                        )}
                                        value={params.max}
                                        onChange={max =>
                                            setParams(
                                                parseInt(params.min),
                                                parseInt(max),
                                                params.palette
                                            )
                                        }
                                        style={styles.flexInnerColumn}
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
                                        style={styles.flexInnerColumn}
                                    />
                                </div>,
                                <div key="range_error" style={styles.error}>
                                    {!this.isValidRange() && rangeError}
                                </div>,
                                <div key="steps_error" style={styles.error}>
                                    {!this.isValidSteps() && stepsError}
                                </div>,
                                <ColorScaleSelect
                                    key="scale"
                                    palette={params.palette}
                                    onChange={palette =>
                                        setParams(
                                            params.min,
                                            params.max,
                                            palette
                                        )
                                    }
                                    style={styles.colorScale}
                                />,
                            ]}
                        </div>

                        {params && (
                            <div style={styles.flexColumn}>
                                <div style={styles.legendTitle}>
                                    {i18n.t('Legend preview')}
                                </div>
                                <div
                                    className="Legend"
                                    style={{ marginLeft: -32 }}
                                >
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
        const dataset = datasets[datasetId];
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
        const dataset = datasets[datasetId];

        if (datasetId !== 'USGS/SRTMGL1_003' && !filter) {
            return this.setErrorState(
                'filterError',
                i18n.t('This field is required'),
                'style'
            );
        }

        if (params) {
            const { min, max } = params;
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

export default connect(
    null,
    { setParams, setFilter },
    null,
    { withRef: true }
)(withStyles(styles)(EarthEngineDialog));
