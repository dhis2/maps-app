import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Popup from '../Popup';
import { apiFetch } from '../../../util/api';
import { formatTime, formatCoordinate } from '../../../util/helpers';
import { EVENT_ID_FIELD } from '../../../util/geojson';

// Returns true if value is not undefined or null;
const hasValue = value => value !== undefined && value !== null;

// Loads event data for the selected feature
const loadEventData = async feature => {
    if (!feature) {
        return null;
    }

    const id = feature.properties.id || feature.properties[EVENT_ID_FIELD];

    return apiFetch(`/events/${id}`);
};

// Returns table rows for all display elements
const getDataRows = (displayElements, dataValues, styleDataItem, value) => {
    const dataRows = [];

    // Include data element used for styling if not included below
    if (
        styleDataItem &&
        !displayElements.find(d => d.id === styleDataItem.id)
    ) {
        dataRows.push(
            <tr key={styleDataItem.id}>
                <th>{styleDataItem.name}</th>
                <td>{hasValue(value) ? value : i18n.t('Not set')}</td>
            </tr>
        );
    }

    // Include rows for each displayInReport data elements
    displayElements.forEach(({ id, name, valueType, options }) => {
        const { value } = dataValues.find(d => d.dataElement === id) || {};
        let formattedValue = value;

        if (valueType === 'COORDINATE' && value) {
            formattedValue = formatCoordinate(value);
        } else if (!hasValue(value)) {
            formattedValue = i18n.t('Not set');
        } else if (options) {
            formattedValue = options[value];
        }

        dataRows.push(
            <tr key={id}>
                <th>{name}</th>
                <td>{formattedValue}</td>
            </tr>
        );
    });

    if (dataRows.length) {
        dataRows.push(<tr key="divider" style={{ height: 5 }} />);
    }

    return dataRows;
};

// Will display a popup for an event feature
const EventPopup = props => {
    const {
        coordinates,
        feature,
        styleDataItem,
        displayElements,
        eventCoordinateFieldName,
        onClose,
    } = props;

    const [eventData, setEventData] = useState();

    // Load event data every time a new feature is clicked
    useEffect(() => {
        let aborted = false;

        loadEventData(feature).then(data => {
            if (!aborted) {
                setEventData(data);
            }
        });

        return () => {
            setEventData(); // Clear event data
            aborted = true;
        };
    }, [feature, setEventData]);

    const { type, coordinates: coord } = feature.geometry;
    const { value } = feature.properties;
    const { dataValues = [], eventDate, orgUnitName } = eventData || {};

    return (
        <Popup
            coordinates={coordinates}
            onClose={onClose}
            className="dhis2-map-popup-event"
        >
            <table>
                <tbody>
                    {eventData &&
                        getDataRows(
                            displayElements,
                            dataValues,
                            styleDataItem,
                            value
                        )}
                    {type === 'Point' && (
                        <tr>
                            <th>
                                {eventCoordinateFieldName ||
                                    i18n.t('Event location')}
                            </th>
                            <td>
                                {coord[0].toFixed(6)} {coord[1].toFixed(6)}
                            </td>
                        </tr>
                    )}
                    {orgUnitName && (
                        <tr>
                            <th>{i18n.t('Organisation unit')}</th>
                            <td>{orgUnitName}</td>
                        </tr>
                    )}
                    {eventDate && (
                        <tr>
                            <th>{i18n.t('Event time')}</th>
                            <td>{formatTime(eventDate)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Popup>
    );
};

EventPopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    displayElements: PropTypes.array.isRequired,
    eventCoordinateFieldName: PropTypes.string,
    styleDataItem: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default EventPopup;
