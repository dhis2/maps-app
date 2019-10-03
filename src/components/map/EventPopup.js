import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import Popup from './Popup';
import { apiFetch } from '../../util/api';
import { getDisplayPropertyUrl, formatCoordinate } from '../../util/helpers';

class EventPopup extends PureComponent {
    static propTypes = {
        coordinates: PropTypes.array,
        feature: PropTypes.object,
        programStage: PropTypes.object,
        eventCoordinateField: PropTypes.string,
        styleDataItem: PropTypes.object,
        onClose: PropTypes.func.isRequired,
    };

    state = {
        data: null,
        displayElements: null,
        eventCoordinateFieldName: null,
    };

    componentDidMount() {
        if (this.props.programStage) {
            this.loadDataElements();
        }
    }

    componentDidUpdate(prevProps) {
        const { feature } = this.props;

        if (feature && feature !== prevProps.feature) {
            apiFetch(`/events/${feature.id}`).then(data =>
                this.setState({ data })
            );
        }
    }

    render() {
        const { coordinates, feature, styleDataItem } = this.props;
        const { data, displayElements = {} } = this.state;

        if (!coordinates || !feature || !data) {
            return null;
        }

        const { type, coordinates: coord } = feature.geometry;
        const { value } = feature.properties;
        const { eventDate, dataValues = [], orgUnitName } = data;
        const date = eventDate.substring(0, 10);
        const time = eventDate.substring(11, 16);

        // Output value if styled by data item, and item is not included in dataRows below
        const styleDataRow = styleDataItem &&
            !displayElements[styleDataItem.id] && (
                <tr>
                    <th>{styleDataItem.name}</th>
                    <td>{value !== undefined ? value : i18n.t('Not set')}</td>
                </tr>
            );

        const dataRows = dataValues.map(({ dataElement, value }) => {
            const displayEl = displayElements[dataElement];

            if (!displayEl) {
                return null;
            }

            const { valueType, optionSet, name } = displayEl;
            let formattedValue = value;

            if (valueType === 'COORDINATE' && value) {
                formattedValue = formatCoordinate(value);
            } else if (optionSet) {
                formattedValue = optionSet[value];
            } else if (value === null || value === undefined) {
                formattedValue = i18n.t('Not set');
            }

            return (
                <tr key={dataElement}>
                    <th>{name}</th>
                    <td>{formattedValue}</td>
                </tr>
            );
        });

        return (
            <Popup
                coordinates={coordinates}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-event"
            >
                <table>
                    <tbody>
                        {styleDataRow}
                        {dataRows}
                        {dataRows.length && <tr style={{ height: 5 }} />}
                        {type === 'Point' && (
                            <tr>
                                <th>
                                    {this.eventCoordinateFieldName ||
                                        i18n.t('Event location')}
                                </th>
                                <td>
                                    {coord[0]} {coord[1]}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <th>{i18n.t('Organisation unit')}</th>
                            <td>{orgUnitName}</td>
                        </tr>
                        <tr>
                            <th>{i18n.t('Event time')}</th>
                            <td>
                                {date} {time}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Popup>
        );
    }

    // Load data elements that should be displayed in popups
    // TODO: Possible to only load "displayInReports" data elements from api?
    async loadDataElements() {
        const { programStage, eventCoordinateField } = this.props;
        const d2 = await getD2();
        const data = await d2.models.programStage.get(programStage.id, {
            fields: `programStageDataElements[displayInReports,dataElement[id,${getDisplayPropertyUrl(
                d2
            )},optionSet,valueType]]`,
            paging: false,
        });
        const { programStageDataElements } = data;

        if (programStageDataElements) {
            const displayElements = {};
            let eventCoordinateFieldName;

            programStageDataElements.forEach(el => {
                const dataElement = el.dataElement;

                if (el.displayInReports) {
                    displayElements[dataElement.id] = dataElement;

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
                    eventCoordinateField &&
                    dataElement.id === eventCoordinateField
                ) {
                    eventCoordinateFieldName = dataElement.name;
                }
            });

            this.setState({ displayElements, eventCoordinateFieldName });
        }
    }

    onPopupClose = () => {
        this.props.onClose();
        this.setState({ data: null });
    };
}

export default EventPopup;
