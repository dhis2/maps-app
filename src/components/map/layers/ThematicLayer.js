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
import { getPeriodFromFilters } from '../../../util/analytics.js'
import { filterData } from '../../../util/filter.js'
import { getLabelStyle } from '../../../util/labels.js'
import {
    sortPeriodsByLevelAndStartDate,
    addPeriodsDetails,
} from '../../../util/periods.js'
import Timeline from '../../periods/Timeline.js'
import { poleOfInaccessibility } from '../MapApi.js'
import PeriodName from '../PeriodName.js'
import Popup from '../Popup.js'
import Layer from './Layer.js'

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
            dataFilters,
            labels,
            valuesByPeriod,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
            thematicMapType = THEMATIC_CHOROPLETH,
            noDataColor,
        } = this.props

        const { period } = this.state

        const { isPlugin, map } = this.context

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE

        let periodData = bubbleMap ? polygonsToPoints(data) : data

        if (renderingStrategy !== RENDERING_STRATEGY_SINGLE) {
            const values = valuesByPeriod[period.id] || {}

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

        const filteredData = filterData(periodData, dataFilters)

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
        const { columns, aggregationType, legend } = this.props
        const { popup, period } = this.state
        const { coordinates, feature } = popup
        const { id, name, value } = feature.properties
        const indicator = columns[0].items[0].name || ''
        const periodName = period ? period.name : legend.period

        return (
            <Popup
                coordinates={coordinates}
                orgUnitId={id}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-orgunit"
            >
                <em>{name}</em>
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
        const { periods, renderingStrategy, filters, resizeCount } = this.props
        const { period, popup } = this.state
        const { id } = getPeriodFromFilters(filters) || {}

        return (
            <Fragment>
                {renderingStrategy === RENDERING_STRATEGY_TIMELINE &&
                    period && (
                        <Fragment>
                            <PeriodName
                                period={period.name}
                                isTimeline={true}
                            />
                            <ThematicLayerContext.Provider
                                value={{ map: this.context.map }}
                            >
                                <Timeline
                                    periodId={id}
                                    period={period}
                                    periods={periods}
                                    onChange={this.onPeriodChange}
                                    resizeCount={resizeCount}
                                />
                            </ThematicLayerContext.Provider>
                        </Fragment>
                    )}
                {popup && this.getPopup()}
            </Fragment>
        )
    }

    onPeriodChange = (period) => {
        this.setState((prevState) => {
            const { popup } = prevState
            if (!popup) {
                return { period }
            }

            const { valuesByPeriod } = this.props
            const newValues = valuesByPeriod[period.id] || {}
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

            return {
                period,
                popup: updatedPopup,
            }
        })
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt })
    }
}

export default ThematicLayer
