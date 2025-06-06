import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { EVENT_ID_FIELD } from '../../../util/geojson.js'
import {
    formatDatetime,
    formatCoordinate,
    formatValueForDisplay,
} from '../../../util/helpers.js'
import { ORG_UNIT_QUERY } from '../../../util/orgUnits.js'
import Popup from '../Popup.js'
import styles from './styles/Popup.module.css'

const EVENTS_QUERY = {
    events: {
        resource: 'tracker/events',
        id: ({ id }) => id,
    },
}

const getDataRows = ({ displayItems, dataValues }) => {
    const dataRows = []

    // Include rows for each data item used for styling and displayInReport
    displayItems.forEach(({ id, name, valueType, options }) => {
        const { value } = dataValues.find((d) => d.dataElement === id) || {}
        const formattedValue = formatValueForDisplay({
            value,
            valueType,
            options,
        })

        dataRows.push(
            <tr key={id}>
                <th>{name}</th>
                <td>{formattedValue}</td>
            </tr>
        )
    })

    if (dataRows.length) {
        dataRows.push(<tr key="divider" className={styles.divider} />)
    }

    return dataRows
}

// Will display a popup for an event feature
const EventPopup = ({
    coordinates,
    feature,
    styleDataItem,
    nameProperty,
    displayItems,
    eventCoordinateFieldName,
    onClose,
}) => {
    const [orgUnit, setOrgUnit] = useState()

    const { refetch: refetchOrgUnit, fetching: fetchingOrgUnit } = useDataQuery(
        ORG_UNIT_QUERY,
        {
            lazy: true,
        }
    )
    const {
        error: errorEvent,
        data: dataEvent,
        refetch: refetchEvent,
        fetching: fetchingEvent,
    } = useDataQuery(EVENTS_QUERY, {
        lazy: true,
    })

    useEffect(() => {
        const fetchEventandOU = async () => {
            const resultEvent = await refetchEvent({
                id: feature.properties.id || feature.properties[EVENT_ID_FIELD],
            })
            const idOrgUnit = resultEvent?.events?.orgUnit

            if (idOrgUnit) {
                const resultOrgUnit = await refetchOrgUnit({
                    id: idOrgUnit,
                    nameProperty,
                })
                const nameOrgUnit = resultOrgUnit?.orgUnit?.name

                setOrgUnit(nameOrgUnit)
            }
        }
        fetchEventandOU()
    }, [feature, nameProperty, refetchEvent, refetchOrgUnit])

    const { type, coordinates: coord } = feature.geometry
    const { dataValues = [], occurredAt } = dataEvent?.events || {}
    const dataValueIndex = dataValues.findIndex(
        (d) => d.dataElement === styleDataItem?.id
    )
    if (dataValueIndex !== -1) {
        dataValues[dataValueIndex] = {
            dataElement: styleDataItem?.id,
            value: feature.properties.value,
        }
    } else {
        dataValues.push({
            dataElement: styleDataItem?.id,
            value: feature.properties.value,
        })
    }

    return (
        <Popup
            coordinates={coordinates}
            onClose={onClose}
            className={styles.eventPopup}
        >
            {errorEvent && (
                <table>
                    <tbody>
                        <tr>{i18n.t('Could not retrieve event data')}</tr>
                        <tr key="divider" className={styles.divider} />
                    </tbody>
                </table>
            )}
            {!fetchingEvent && !fetchingOrgUnit && (
                <table>
                    <tbody>
                        {dataEvent?.events &&
                            getDataRows({
                                displayItems,
                                dataValues,
                            })}
                        {type === 'Point' && (
                            <tr>
                                <th>
                                    {eventCoordinateFieldName ||
                                        i18n.t('Event location')}
                                </th>
                                <td>{formatCoordinate(coord)}</td>
                            </tr>
                        )}
                        {orgUnit && (
                            <tr>
                                <th>{i18n.t('Organisation unit')}</th>
                                <td>{orgUnit}</td>
                            </tr>
                        )}
                        {occurredAt && (
                            <tr>
                                <th>{i18n.t('Event time')}</th>
                                <td>{formatDatetime(occurredAt)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </Popup>
    )
}

EventPopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    displayItems: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    nameProperty: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    eventCoordinateFieldName: PropTypes.string,
    styleDataItem: PropTypes.object,
}

export default EventPopup
