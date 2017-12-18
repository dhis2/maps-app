import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import ColorScaleSelect from '../d2-ui/ColorScaleSelect';
import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
import TextField from 'd2-ui/lib/text-field/TextField';
import Collection from '../earthengine/Collection';
import LegendItem from '../layers/legend/LegendItem';
import { setParams, setFilter } from '../../actions/layerEdit';
import { getColorScale, getColorPalette } from '../../util/colorscale';
import { createLegend } from '../../loaders/earthEngineLoader';
import '../layers/legend/Legend.css';


const datasets = {
    'WorldPop/POP': { // Population density
        description: 'Population density estimates with national totals adjusted to match UN population division estimates. Try a different year if you don\'t see data for your country.',
        collectionLabel: 'Select year',
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: 'Min people',
        maxLabel: 'Max people',
    },
    'USGS/SRTMGL1_003': { // Elevation
        description: 'Elevation above sea-level. You can adjust the min and max values so it better representes the terrain in your region.',
        minValue: 0,
        maxValue: 8848,
        minLabel: 'Min meters',
        maxLabel: 'Max meters',
    },
    'UCSB-CHG/CHIRPS/PENTAD' : { // Precipitation
        description: 'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.',
        minValue: 0,
        maxValue: 100,
        minLabel: 'Min mm',
        maxLabel: 'Max mm',
    },
    'MODIS/MOD11A2' : { // Temperature
        description: 'Land surface temperatures collected from satellite in 8 days periods. Blank spots will appear in areas with a persistent cloud cover.',
        minValue: -100,
        maxValue: 100,
        minLabel: 'Min °C',
        maxLabel: 'Max °C',
    },
    'MODIS/051/MCD12Q1' : { // Landcover
        description: '17 distinct landcover types collected from satellites.',
        valueLabel: 'Select year',

    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS' : { // Nighttime lights
        description: 'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.',
        valueLabel: 'Select year',
        minValue: 0,
        maxValue: 63,
    },
};

const styles = {
    tabs: {
        height: 376,
    },
    flex: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
        padding: 12,
    },
    flexColumn: {
        flex: '50%',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
        boxSizing: 'border-box',
    },
    flexFull: {
        flex: '100%',
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    flexThird: {
        flex: '33%',
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    legend: {
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    legendTitle: {
        padding: '16px 0 16px 32px',
        fontWeight: 'bold',
    },
};

class EarthEngineDialog extends Component {

    // Steps are less as we also have colors for above and below (not below if min = 0)
    getStepsFromParams() {
        const { palette, min } = this.props.params;
        return palette.split(',').length - (min === 0 ? 1 : 2);
    }

    // Always set state to update text field, but only store if valid
    onStepsChange(steps) {
        const { min, max, palette } = this.props.params;

        this.setState({ steps });

        if (steps > 0 && steps < 8) { // Valid steps: 1-7
            const scale = getColorScale(palette);
            const classes = (steps == 1 && min == 0 ? 2 : steps) + (min == 0 ? 1 : 2);
            const newPalette = getColorPalette(scale, classes);

            if (newPalette) {
                this.props.setParams(min, max, newPalette.join());
            }
        }
    }

    // TODO: Create a d2-ui number field that returns numbers (not text) and controls min and max
    render() {
        const { datasetId, params, filter, setParams, setFilter } = this.props;
        const dataset = datasets[datasetId];

        return (
            <Tabs style={styles.tabs}>
                <Tab label={i18next.t('Style')}>
                    <div style={styles.flex}>
                        <div style={styles.flexColumn}>
                            <div style={{ ...styles.flexFull, marginTop: 16 }}>{dataset.description}</div>
                            {datasetId !== 'USGS/SRTMGL1_003' && // If not elevation
                                <Collection
                                    label={i18next.t(dataset.collectionLabel)}
                                    id={datasetId}
                                    filter={filter}
                                    onChange={setFilter}
                                    style={styles.flexFull}
                                />
                            }
                            {params && [
                                <TextField
                                    key='min'
                                    type='number'
                                    label={i18next.t(dataset.minLabel || 'Min')}
                                    value={params.min}
                                    onChange={min => setParams(parseInt(min), parseInt(params.max), params.palette)}
                                    style={styles.flexThird}
                                />,
                                <TextField
                                    key='max'
                                    type='number'
                                    label={i18next.t(dataset.maxLabel || 'Max')}
                                    value={params.max}
                                    onChange={max => setParams(parseInt(params.min), parseInt(max), params.palette)}
                                    style={styles.flexThird}
                                />,
                                <TextField
                                    key='steps'
                                    type='number'
                                    label={i18next.t('Steps')}
                                    value={this.state ? this.state.steps : this.getStepsFromParams() || ''}
                                    onChange={steps => this.onStepsChange(parseInt(steps))}
                                    style={styles.flexThird}
                                />,
                                <ColorScaleSelect
                                    key='scale'
                                    palette={params.palette}
                                    onChange={palette => setParams(params.min, params.max, palette.join())}
                                />,
                            ]}
                        </div>
                        <div style={styles.flexColumn}>
                            {params &&
                                <div style={styles.legend}>
                                    <div style={styles.legendTitle}>{i18next.t('Legend preview')}</div>
                                    <dl className='Legend'>
                                        {createLegend(params).map((item, index) => (
                                            <LegendItem
                                                {...item}
                                                key={`item-${index}`}
                                            />
                                        ))}
                                    </dl>
                                </div>
                            }
                        </div>
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

export default connect(null, { setParams, setFilter })(EarthEngineDialog);
