import i18n from '@dhis2/d2-i18n'
import { scaleSqrt } from 'd3-scale'
import { Marker } from 'maplibre-gl'
import React, { Fragment } from 'react'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    THEMATIC_CHOROPLETH,
    THEMATIC_BUBBLE,
    THEMATIC_CHART,
    CHART_TYPE_DONUT,
    THEMATIC_CHART_MARKER_MIN_SIZE,
    THEMATIC_CHART_MARKER_MAX_SIZE,
    BOUNDARY_LAYER,
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS_SMALL,
    LABEL_TEMPLATE_NAME_ONLY,
    PADDING_TIMELINE,
    DURATION_TIMELINE,
} from '../../../constants/layers.js'
import { createChartMarkerElement } from '../../../util/chartMarker.js'
import { filterData } from '../../../util/filter.js'
import { getLabelStyle } from '../../../util/labels.js'
import {
    sortPeriodsByLevelAndStartDate,
    addPeriodsDetails,
} from '../../../util/periods.js'
import { poleOfInaccessibility } from '../MapApi.js'
import Popup from '../Popup.jsx'
import Layer from './Layer.js'
import styles from './styles/Popup.module.css'

export const ThematicLayerContext = React.createContext()

// Translating polygons to points using poleOfInaccessibility from maps-gl
const polygonsToPoints = (features) =>
    features.map((feature) => ({
        ...feature,
        geometry: {
            type: 'Point',
            coordinates: poleOfInaccessibility(feature.geometry),
        },
    }))

class ThematicLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            labels,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
            thematicMapType = THEMATIC_CHOROPLETH,
            noDataLegend,
        } = this.props

        const { isPlugin, map } = this.context

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE
        const isChartMap = thematicMapType === THEMATIC_CHART

        const filteredData = this.buildPeriodData()

        const config = {
            type: 'choropleth',
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            hoverLabel: '{name} ({value})',
            color: noDataLegend?.color,
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        }

        if (labels) {
            config.label = this.props.labelTemplate || LABEL_TEMPLATE_NAME_ONLY
            config.labelStyle = getLabelStyle(this.props)
        }

        // Add boundaries as a separate layer
        if (bubbleMap) {
            this.layer = map.createLayer({
                type: 'group',
                id,
                index,
                opacity,
                isVisible,
            })

            this.layer.addLayer({
                type: BOUNDARY_LAYER,
                data: data.map((f) => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        style: {
                            color: ORG_UNIT_COLOR,
                            weight: 0.5,
                        },
                    },
                })),
                style: {},
            })

            this.layer.addLayer(config)
        } else if (isChartMap) {
            // Chart map mockup for DHIS2-21461: boundaries only through
            // maps-gl, donut/bar markers are plain maplibre-gl Markers
            // managed directly by this component (see buildChartMarkers)
            this.layer = map.createLayer({
                type: 'group',
                id,
                index,
                opacity,
                isVisible,
            })

            this.layer.addLayer({
                type: BOUNDARY_LAYER,
                data: data.map((f) => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        style: {
                            color: ORG_UNIT_COLOR,
                            weight: 0.5,
                        },
                    },
                })),
                style: {},
            })

            this.buildChartMarkers(filteredData)
        } else {
            this.layer = map.createLayer(config)
        }

        map.addLayer(this.layer)
        this.setLayerVisibility()

        const options = {}
        if (renderingStrategy === RENDERING_STRATEGY_TIMELINE) {
            options.padding = PADDING_TIMELINE
            if (isPlugin) {
                options.duration = DURATION_TIMELINE
            }
        }

        if (!isPlugin) {
            this.fitBoundsOnce(options)
        } else {
            this.fitBounds(options)
        }
    }

    // Chart map mockup for DHIS2-21461: places one donut/bar SVG marker per
    // feature directly on the underlying maplibre-gl map, sized by each
    // feature's series total (sqrt scale, so area — not radius — tracks
    // the value, matching how bubble maps already scale their radius)
    buildChartMarkers(features) {
        const { chartType = CHART_TYPE_DONUT } = this.props
        const mapGL = this.context.map.getMapGL()

        this.removeChartMarkers()

        const chartFeatures = features.filter((f) => f.properties.chartValues)
        const totals = chartFeatures.map((f) =>
            f.properties.chartValues.reduce((sum, s) => sum + s.value, 0)
        )
        const getSize = scaleSqrt()
            .domain([0, Math.max(...totals, 1)])
            .range([
                THEMATIC_CHART_MARKER_MIN_SIZE,
                THEMATIC_CHART_MARKER_MAX_SIZE,
            ])
            .clamp(true)

        this.chartMarkers = chartFeatures.map((feature) => {
            const total = feature.properties.chartValues.reduce(
                (sum, s) => sum + s.value,
                0
            )
            const coordinates = poleOfInaccessibility(feature.geometry)
            const el = createChartMarkerElement(
                chartType,
                feature.properties.chartValues,
                getSize(total)
            )

            el.addEventListener('click', (evt) => {
                evt.stopPropagation()
                this.onFeatureClick({ feature, coordinates })
            })

            return new Marker({ element: el })
                .setLngLat(coordinates)
                .addTo(mapGL)
        })
    }

    removeChartMarkers() {
        this.chartMarkers?.forEach((marker) => marker.remove())
        this.chartMarkers = []
    }

    async removeLayer() {
        this.removeChartMarkers()
        await super.removeLayer()
    }

    // Set initial period
    setPeriod(callback) {
        const {
            externalPeriod,
            periods,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
        } = this.props

        if (!externalPeriod && !periods) {
            return
        }

        const initialPeriod = {}
        switch (renderingStrategy) {
            case RENDERING_STRATEGY_TIMELINE:
                initialPeriod.period = sortPeriodsByLevelAndStartDate(
                    addPeriodsDetails(periods).periodsWithTypeLevelAndRank
                )[0]
                break
            case RENDERING_STRATEGY_SPLIT_BY_PERIOD:
                initialPeriod.period = externalPeriod
                break
            default:
                initialPeriod.period = null
                break
        }

        // setPeriod without callback is called from the constructor (unmounted)
        if (!callback) {
            this.state = initialPeriod
        } else {
            this.setState(initialPeriod, callback)
        }
    }

    getPopup() {
        const { columns, aggregationType, legend, externalPeriod } = this.props
        const { popup } = this.state
        const { coordinates, feature } = popup
        const { id, name, value, chartValues } = feature.properties

        if (chartValues) {
            return (
                <Popup
                    coordinates={coordinates}
                    orgUnitId={id}
                    onClose={this.onPopupClose}
                    className={styles.thematicPopup}
                >
                    <div className={styles.title}>{name}</div>
                    <table>
                        <tbody>
                            {chartValues.map((series) => (
                                <tr key={series.id}>
                                    <th>{series.name}</th>
                                    <td>{series.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Popup>
            )
        }

        const indicator = columns[0].items[0].name || ''
        const periodName = externalPeriod ? externalPeriod.name : legend.period

        return (
            <Popup
                coordinates={coordinates}
                orgUnitId={id}
                onClose={this.onPopupClose}
                className={styles.thematicPopup}
            >
                <div className={styles.title}>{name}</div>
                <div>{indicator}</div>
                <div>{periodName}</div>
                <div>
                    {i18n.t('Value')}: {value ?? i18n.t('No data')}
                </div>
                {aggregationType && aggregationType !== 'DEFAULT' && (
                    <div>{aggregationType}</div>
                )}
            </Popup>
        )
    }

    render() {
        const { popup } = this.state
        return <Fragment>{popup && this.getPopup()}</Fragment>
    }

    componentDidUpdate(prevProps) {
        const prevPeriodId = prevProps.externalPeriod?.id
        const newPeriodId = this.props.externalPeriod?.id

        const dataChanged = prevProps.data !== this.props.data
        const valuesChanged =
            prevProps.valuesByPeriod !== this.props.valuesByPeriod
        const filtersChanged = prevProps.dataFilters !== this.props.dataFilters
        const renderingChanged =
            prevProps.renderingStrategy !== this.props.renderingStrategy

        if (
            !dataChanged &&
            !valuesChanged &&
            !filtersChanged &&
            !renderingChanged &&
            prevPeriodId === newPeriodId
        ) {
            this.setLayerOpacity()
            this.setLayerVisibility()
            this.setLayerOrder()
            return
        }

        const { valuesByPeriod, thematicMapType = THEMATIC_CHOROPLETH } =
            this.props

        // Rebuild the period-specific data the same way as in createLayer
        const bubbleMap = thematicMapType === THEMATIC_BUBBLE
        const isChartMap = thematicMapType === THEMATIC_CHART
        const filteredData = this.buildPeriodData()

        // If the underlying map layer supports incremental updates, use it.
        // For group/bubble/chart layers we fall back to recreating the layer.
        if (
            this.layer &&
            !bubbleMap &&
            !isChartMap &&
            typeof this.layer.setData === 'function'
        ) {
            try {
                this.layer.setData(filteredData)
            } catch (e) {
                console.warn('Failed to set layer data incrementally:', e)
                // fallback to full update on error
                this.updateLayer()
            }
        } else {
            // Recreate layer to pick up changes
            this.updateLayer()
        }

        // Sync popup contents if open
        const { popup } = this.state
        if (popup && this.props.externalPeriod) {
            const newValues =
                (valuesByPeriod &&
                    this.props.externalPeriod &&
                    valuesByPeriod[this.props.externalPeriod.id]) ||
                {}
            const updatedPopup = {
                ...popup,
                feature: {
                    ...popup.feature,
                    properties: {
                        ...popup.feature.properties,
                        ...(newValues[popup.feature.properties.id] || {
                            value: i18n.t('Not set'),
                        }),
                    },
                },
            }

            this.setState({ popup: updatedPopup })
        }
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt })
    }

    buildPeriodData(props = this.props) {
        const {
            data,
            dataFilters,
            valuesByPeriod,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
            thematicMapType = THEMATIC_CHOROPLETH,
            noDataLegend,
            unclassifiedLegend,
            externalPeriod,
        } = props

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE

        // Convert polygons to points for bubble maps
        let periodData = bubbleMap ? polygonsToPoints(data) : data

        if (renderingStrategy !== RENDERING_STRATEGY_SINGLE && externalPeriod) {
            const values = valuesByPeriod?.[externalPeriod.id] || {}

            periodData = periodData.map((f) => ({
                ...f,
                properties: {
                    ...f.properties,
                    ...values[f.id],
                    ...(f.properties.hasAdditionalGeometry &&
                        f.geometry.type === 'Point' && {
                            color: ORG_UNIT_COLOR,
                            radius: ORG_UNIT_RADIUS_SMALL,
                        }),
                },
            }))

            if (!noDataLegend) {
                periodData = periodData.filter(
                    (feature) => values[feature.id] !== undefined
                )
            }

            if (!unclassifiedLegend) {
                periodData = periodData.filter(
                    (feature) => !values[feature.id]?.isUnclassified
                )
            }
        }

        return filterData(periodData, dataFilters)
    }
}

export default ThematicLayer
