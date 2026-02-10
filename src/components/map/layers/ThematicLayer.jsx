import i18n from '@dhis2/d2-i18n'
import React, { Fragment } from 'react'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    THEMATIC_CHOROPLETH,
    THEMATIC_BUBBLE,
    BOUNDARY_LAYER,
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS_SMALL,
    LABEL_TEMPLATE_NAME_ONLY,
    PADDING_TIMELINE,
    DURATION_TIMELINE,
} from '../../../constants/layers.js'
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
            noDataColor,
        } = this.props

        const { isPlugin, map } = this.context

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE

        const filteredData = this.buildPeriodData()

        const config = {
            type: 'choropleth',
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            hoverLabel: '{name} ({value})',
            color: noDataColor,
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
        } else {
            this.layer = map.createLayer(config)
        }

        map.addLayer(this.layer)

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

    // Set initial period
    setPeriod(callback) {
        const {
            period,
            periods,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
        } = this.props

        if (!period && !periods) {
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
                initialPeriod.period = period
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
        const { columns, aggregationType, legend, period } = this.props
        const { popup } = this.state
        const { coordinates, feature } = popup
        const { id, name, value } = feature.properties
        const indicator = columns[0].items[0].name || ''
        const periodName = period ? period.name : legend.period

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
        const prevPeriodId = prevProps.period?.id
        const newPeriodId = this.props.period?.id

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
            return
        }

        const { valuesByPeriod, thematicMapType = THEMATIC_CHOROPLETH } =
            this.props

        // Rebuild the period-specific data the same way as in createLayer
        const bubbleMap = thematicMapType === THEMATIC_BUBBLE
        const filteredData = this.buildPeriodData()

        // If the underlying map layer supports incremental updates, use it.
        // For group/bubble layers we fall back to recreating the layer.
        if (
            this.layer &&
            !bubbleMap &&
            typeof this.layer.setData === 'function'
        ) {
            try {
                this.layer.setData(filteredData)
            } catch (e) {
                console.warning('Failed to set layer data incrementally.')
                // fallback to full update on error
                this.updateLayer()
            }
        } else {
            // Recreate layer to pick up changes
            this.updateLayer()
        }

        // Sync popup contents if open
        const { popup } = this.state
        if (popup && this.props.period) {
            const newValues =
                (valuesByPeriod &&
                    this.props.period &&
                    valuesByPeriod[this.props.period.id]) ||
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
            noDataColor,
            period,
        } = props

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE

        // Convert polygons to points for bubble maps
        let periodData = bubbleMap ? polygonsToPoints(data) : data

        if (renderingStrategy !== RENDERING_STRATEGY_SINGLE && period) {
            const values = valuesByPeriod?.[period.id] || {}

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

            // Remove org unit features if noDataColor is missing
            if (!noDataColor) {
                periodData = periodData.filter(
                    (feature) => values[feature.id] !== undefined
                )
            }
        }

        return filterData(periodData, dataFilters)
    }
}

export default ThematicLayer
