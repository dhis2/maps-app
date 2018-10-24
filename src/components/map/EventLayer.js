import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import {
    getAnalyticsRequest,
    addStyleDataItem,
} from '../../loaders/eventLoader';
import {
    getOrgUnitsFromRows,
    getPeriodFromFilters,
} from '../../util/analytics';
import { EVENT_COLOR, EVENT_RADIUS } from '../../constants/layers';
import Layer from './Layer';
import { getHtmlLegend } from '../../util/legend';
import { getDisplayPropertyUrl } from '../../util/helpers';

class EventLayer extends Layer {
    createLayer() {
        const {
            bounds,
            columns,
            data,
            endDate,
            eventClustering,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            filters,
            id,
            program,
            programStage,
            rows,
            serverCluster,
            startDate,
            styleDataItem,
            areaRadius,
            relativePeriodDate,
            legend,
            isPlugin,
        } = this.props;

        // Some older favorites don't have a valid color code
        const color =
            eventPointColor && eventPointColor.charAt(0) !== '#'
                ? '#' + eventPointColor
                : eventPointColor;

        const orgUnits = getOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const dataItems = addStyleDataItem(columns, styleDataItem);
        const map = this.context.map;
        let d2;
        let eventRequest;

        // Data elements to display in event popup
        this.displayElements = {};

        // Default props = no cluster
        const config = {
            type: 'dots',
            pane: id,
            data,
            color: color || EVENT_COLOR,
            radius: eventPointRadius || EVENT_RADIUS,
            popup: this.onEventClick.bind(this),
        };

        if (eventClustering) {
            if (serverCluster) {
                config.type = 'serverCluster';
                config.bounds = bounds;

                config.load = async (params, callback) => {
                    d2 = d2 || (await getD2());

                    eventRequest =
                        eventRequest ||
                        (await getAnalyticsRequest(
                            program,
                            programStage,
                            period,
                            startDate,
                            endDate,
                            orgUnits,
                            dataItems,
                            eventCoordinateField,
                            relativePeriodDate
                        ));

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
            // Create and add buffer area layer
            this.buffers = map.addLayer({
                type: 'circles',
                pane: `${id}-area`,
                radius: areaRadius,
                style: {
                    color: color || EVENT_COLOR,
                    weight: 1,
                    opacity: 0.2,
                    fillOpacity: 0.1,
                },
                highlightStyle: false,
                data,
            });
        }

        // Create and add event layer based on config object
        this.layer = map.createLayer(config).addTo(map);

        // Create legend in HTML if showed as plugin
        if (isPlugin && legend) {
            map.legend =
                (map.legend || '') + getHtmlLegend(legend, data.length > 0);
        }

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }

        if (program && programStage) {
            this.loadDataElements();
        }
    }

    // Load data elements that should be displayed in popups
    async loadDataElements() {
        const props = this.props;
        const d2 = await getD2();
        const data = await d2.models.programStage.get(props.programStage.id, {
            fields: `programStageDataElements[displayInReports,dataElement[id,${getDisplayPropertyUrl(
                d2
            )},optionSet]]`,
            paging: false,
        });

        if (data.programStageDataElements) {
            data.programStageDataElements.forEach(el => {
                const dataElement = el.dataElement;

                if (el.displayInReports) {
                    this.displayElements[dataElement.id] = dataElement;

                    if (dataElement.optionSet && dataElement.optionSet.id) {
                        d2.models.optionSets
                            .get(dataElement.optionSet.id, {
                                fields:
                                    'id,displayName~rename(name),options[code,displayName~rename(name)]',
                                paging: false,
                            })
                            .then(optionSet => {
                                optionSet.options.forEach(
                                    option =>
                                        (dataElement.optionSet[option.code] =
                                            option.name)
                                );
                            });
                    }
                } else if (
                    props.eventCoordinateField &&
                    dataElement.id === props.eventCoordinateField
                ) {
                    this.eventCoordinateFieldName = dataElement.name;
                }
            });
        }
    }

    onEventClick(feature, callback) {
        const coord = feature.geometry.coordinates;
        const props = feature.properties;
        const { styleDataItem } = this.props;

        apiFetch('/events/' + feature.id).then(data => {
            const time =
                data.eventDate.substring(0, 10) +
                ' ' +
                data.eventDate.substring(11, 16);
            const dataValues = data.dataValues;
            let content = '<table><tbody>';

            // Output value if styled by data item, and item is not included in display elements
            if (styleDataItem && !this.displayElements[styleDataItem.id]) {
                content += `<tr><th>${
                    styleDataItem.name
                }</th><td>${props.value || i18n.t('Not set')}</td></tr>`;
            }

            if (Array.isArray(dataValues)) {
                dataValues.forEach(dataValue => {
                    const displayEl = this.displayElements[
                        dataValue.dataElement
                    ];

                    if (displayEl) {
                        let value = dataValue.value;

                        if (displayEl.optionSet) {
                            value = displayEl.optionSet[value];
                        }

                        content += `<tr><th>${displayEl.name}</th><td>${value ||
                            i18n.t('Not set')}</td></tr>`;
                    }
                });

                content += '<tr style="height:5px;"><th></th><td></td></tr>';
            }

            content += `<tr><th>${i18n.t('Organisation unit')}</th><td>${
                data.orgUnitName
            }</td></tr>
                            <tr><th>${i18n.t(
                                'Event time'
                            )}</th><td>${time}</td></tr>
                            <tr><th>${this.eventCoordinateFieldName ||
                                i18n.t('Event location')}</th><td>${
                coord[0]
            }, ${coord[1]}</td></tr> 
                            </tbody></table>`;

            callback(content);
        });
    }

    toGeoJson(data) {
        const header = {};
        const features = [];

        // Convert headers to object for easier lookup
        data.headers.forEach((h, i) => (header[h.name] = i));

        if (Array.isArray(data.rows)) {
            data.rows.forEach(row => {
                const extent = row[header.extent].match(/([-\d\.]+)/g);
                const coords = row[header.center].match(/([-\d\.]+)/g);

                // Round to 6 decimals - http://www.jacklmoore.com/notes/rounding-in-javascript/
                coords[0] = Number(Math.round(coords[0] + 'e6') + 'e-6');
                coords[1] = Number(Math.round(coords[1] + 'e6') + 'e-6');

                features.push({
                    type: 'Feature',
                    id: row[header.points],
                    geometry: {
                        type: 'Point',
                        coordinates: coords,
                    },
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
}

export default EventLayer;
