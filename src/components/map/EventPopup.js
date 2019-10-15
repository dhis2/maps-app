import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import Popup from './Popup';
import { apiFetch } from '../../util/api';
import {
    getDisplayPropertyUrl,
    formatTime,
    formatCoordinate,
} from '../../util/helpers';

// Returns true if value is not undefined or null;
const hasValue = value => value !== undefined || value !== null;

// Loads an option set for an data element to get option names
const loadOptionSet = async dataElement => {
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
};

// Loads the data elements for a program stage to display in popup
const loadDataElements = async (programStage, eventCoordinateField) => {
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
            await loadOptionSet(d);
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

    return { displayElements, eventCoordinateFieldName };
};

// Loads event data for the selected feature
const loadEventData = async feature =>
    feature ? apiFetch(`/events/${feature.id}`) : null;

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

    displayElements.forEach(({ id, name, valueType, options }) => {
        const { value } = dataValues.find(d => d.dataElement === id) || {};
        let formattedValue = value;

        if (valueType === 'COORDINATE' && value) {
            formattedValue = formatCoordinate(value);
        } else if (options) {
            formattedValue = options[value];
        } else if (!hasValue(value)) {
            formattedValue = i18n.t('Not set');
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

const EventPopup = props => {
    const {
        coordinates,
        feature,
        programStage,
        eventCoordinateField,
        styleDataItem,
        onClose,
    } = props;

    const [eventData, setEventData] = useState();
    const [dataElements, setDataElements] = useState({});
    const { displayElements = [], eventCoordinateFieldName } = dataElements;

    useEffect(() => {
        loadDataElements(programStage, eventCoordinateField).then(
            setDataElements
        );
    }, [programStage]);

    useEffect(() => {
        loadEventData(feature).then(setEventData);
    }, [feature]);

    if (!coordinates || !feature || !eventData) {
        return null;
    }

    const { type, coordinates: coord } = feature.geometry;
    const { value } = feature.properties;
    const { eventDate, dataValues = [], orgUnitName } = eventData;

    return (
        <Popup
            coordinates={coordinates}
            onClose={() => {
                onClose();
                setEventData();
            }}
            className="dhis2-map-popup-event"
        >
            <table>
                <tbody>
                    {getDataRows(
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
                        <td>{formatTime(eventDate)}</td>
                    </tr>
                </tbody>
            </table>
        </Popup>
    );
};

EventPopup.propTypes = {
    coordinates: PropTypes.array,
    feature: PropTypes.object,
    programStage: PropTypes.object,
    eventCoordinateField: PropTypes.string,
    styleDataItem: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default EventPopup;
