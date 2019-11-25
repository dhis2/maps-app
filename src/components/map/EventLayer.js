import React from 'react';
import { getInstance as getD2 } from 'd2';
import { getAnalyticsRequest } from '../../loaders/eventLoader';
import { EVENT_COLOR, EVENT_RADIUS } from '../../constants/layers';
import Layer from './Layer';
import EventPopup from './EventPopup';
import { getDisplayPropertyUrl } from '../../util/helpers';

class EventLayer extends Layer {
    state = {
        popup: null,
        dataElements: null,
        eventCoordinateFieldName: null,
    };

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            bounds,
            data,
            eventClustering,
            eventPointColor,
            eventPointRadius,
            serverCluster,
            areaRadius,
        } = this.props;

        // Some older favorites don't have a valid color code
        const color =
            eventPointColor && eventPointColor.charAt(0) !== '#'
                ? '#' + eventPointColor
                : eventPointColor;

        const map = this.context.map;
        let d2;
        let eventRequest;

        // Data elements to display in event popup
        this.displayElements = {};

        // Default props = no cluster
        const config = {
            type: 'events',
            id,
            index,
            opacity,
            isVisible,
            data,
            fillColor: color || EVENT_COLOR,
            radius: eventPointRadius || EVENT_RADIUS,
            onClick: this.onEventClick.bind(this),
        };

        if (eventClustering) {
            if (serverCluster) {
                config.type = 'serverCluster';
                config.bounds = bounds;

                config.load = async (params, callback) => {
                    d2 = d2 || (await getD2());

                    eventRequest =
                        eventRequest || (await getAnalyticsRequest(this.props));

                    eventRequest = eventRequest
                        .withBbox(params.bbox)
                        .withClusterSize(params.clusterSize)
                        .withIncludeClusterPoints(params.includeClusterPoints);

                    const clusterData = await d2.analytics.events.getCluster(
                        eventRequest
                    );

                    callback(params.tileId, this.toGeoJson(clusterData));
                };
            } else {
                config.type = 'clientCluster';
                config.clusterPane = id;
            }
        } else if (areaRadius) {
            config.buffer = areaRadius;
            config.bufferStyle = {
                color: color || EVENT_COLOR,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1,
            };
        }

        this.loadDisplayElements();

        // Create and add event layer based on config object
        this.layer = map.createLayer(config);
        map.addLayer(this.layer);

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce();
    }

    render() {
        const { styleDataItem } = this.props;
        const { popup, displayElements, eventCoordinateFieldName } = this.state;

        return popup && displayElements ? (
            <EventPopup
                {...popup}
                styleDataItem={styleDataItem}
                displayElements={displayElements}
                eventCoordinateFieldName={eventCoordinateFieldName}
                onClose={this.onPopupClose}
            />
        ) : null;
    }

    onEventClick({ feature, coordinates }) {
        this.setState({ popup: { feature, coordinates } });
    }

    onPopupClose = () => this.setState({ popup: null });

    // Convert server cluster response to GeoJSON
    toGeoJson(data) {
        const header = {};
        const features = [];

        // Convert headers to object for easier lookup
        data.headers.forEach((h, i) => (header[h.name] = i));

        if (Array.isArray(data.rows)) {
            data.rows.forEach(row => {
                const extent = row[header.extent].match(/([-\d.]+)/g);

                features.push({
                    type: 'Feature',
                    id: row[header.points],
                    geometry: JSON.parse(row[header.center]),
                    properties: {
                        count: parseInt(row[header.count], 10),
                        bounds: [
                            [extent[1], extent[0]],
                            [extent[3], extent[2]],
                        ],
                    },
                });
            });
        }

        return features;
    }

    // Loads the data elements for a program stage to display in popup
    async loadDisplayElements() {
        const { programStage, eventCoordinateField } = this.props;

        const d2 = await getD2();
        const data = await d2.models.programStage.get(programStage.id, {
            fields: `programStageDataElements[displayInReports,dataElement[id,${getDisplayPropertyUrl(
                d2
            )},optionSet,valueType]]`,
            paging: false,
        });
        const { programStageDataElements } = data;
        let displayElements = [];
        let eventCoordinateFieldName;

        if (Array.isArray(programStageDataElements)) {
            displayElements = programStageDataElements
                .filter(d => d.displayInReports)
                .map(d => d.dataElement);

            for (let d of displayElements) {
                await this.loadOptionSet(d);
            }

            if (eventCoordinateField) {
                const coordElement = programStageDataElements.find(
                    d => d.dataElement.id === eventCoordinateField
                );

                if (coordElement) {
                    eventCoordinateFieldName = coordElement.dataElement.name;
                }
            }
        }

        this.setState({ displayElements, eventCoordinateFieldName });
    }

    // Loads an option set for an data element to get option names
    async loadOptionSet(dataElement) {
        const { optionSet } = dataElement;

        if (!optionSet || !optionSet.id) {
            return dataElement;
        }

        const d2 = await getD2();

        if (optionSet && optionSet.id) {
            const fullOptionSet = await d2.models.optionSets.get(optionSet.id, {
                fields:
                    'id,displayName~rename(name),options[code,displayName~rename(name)]',
                paging: false,
            });

            if (fullOptionSet && fullOptionSet.options) {
                dataElement.options = fullOptionSet.options.reduce(
                    (byId, option) => {
                        byId[option.code] = option.name;
                        return byId;
                    },
                    {}
                );
            }
        }
    }
}

export default EventLayer;
