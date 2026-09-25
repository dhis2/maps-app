import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { EVENT_COORDINATE_GEOMETRY_SOURCE } from '../../../constants/layers.js'
import { resolveGeometrySourceName } from '../../../util/coordinatesName.js'
import { EVENT_ID_FIELD } from '../../../util/geojson.js'
import {
    formatDatetime,
    formatCoordinate,
    formatValueForDisplay,
} from '../../../util/helpers.js'
import { ORG_UNIT_QUERY } from '../../../util/orgUnits.js'
import Popup from '../Popup.jsx'
import styles from './styles/Popup.module.css'

const EVENTS_QUERY = {
    events: {
        resource: 'tracker/events',
        id: ({ id }) => id,
    },
}

const getDataRows = ({
    displayItems,
    dataValues,
    orgUnitNames,
    keyAnalysisDigitGroupSeparator,
}) => {
    const dataRows = []

    // Include rows for each data item used for styling and displayInReport
    displayItems.forEach(({ id, name, valueType, options }) => {
        const { value } = dataValues.find((d) => d.dataElement === id) || {}
        const formattedValue = formatValueForDisplay({
            value,
            valueType,
            options,
            orgUnitNames,
            keyAnalysisDigitGroupSeparator,
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
    keyAnalysisDigitGroupSeparator,
    displayItems,
    eventCoordinateFieldName,
    geometrySourceNames,
    onClose,
}) => {
    const [orgUnit, setOrgUnit] = useState()
    const [orgUnitNames, setOrgUnitNames] = useState({})

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
        const fetchEventandOUs = async () => {
            const resultEvent = await refetchEvent({
                id: feature.properties.id || feature.properties[EVENT_ID_FIELD],
            })
            const idOrgUnit = resultEvent?.events?.orgUnit

            // Fetch event org unit
            if (idOrgUnit) {
                const resultOrgUnit = await refetchOrgUnit({
                    id: idOrgUnit,
                    nameProperty,
                })
                const nameOrgUnit = resultOrgUnit?.orgUnit?.name
                setOrgUnit(nameOrgUnit)
            }

            // Fetch all org units referenced in displayItems
            const orgUnitIds = displayItems
                .filter(({ valueType }) => valueType === 'ORGANISATION_UNIT')
                .map(({ id }) => {
                    const { value } =
                        resultEvent?.events?.dataValues.find(
                            (d) => d.dataElement === id
                        ) || {}
                    return value
                })
            const orgUnitsNamesMap = {}
            for (const id of orgUnitIds) {
                const result = await refetchOrgUnit({ id, nameProperty })
                orgUnitsNamesMap[id] = result?.orgUnit?.name
            }
            setOrgUnitNames(orgUnitsNamesMap)
        }
        fetchEventandOUs()
    }, [feature, nameProperty, refetchEvent, refetchOrgUnit, displayItems])

    const { type, coordinates: coord } = feature.geometry
    const { dataValues = [], occurredAt } = dataEvent?.events || {}
    if (
        styleDataItem &&
        styleDataItem.id !== EVENT_COORDINATE_GEOMETRY_SOURCE
    ) {
        const dataValueIndex = dataValues.findIndex(
            (d) => d.dataElement === styleDataItem.id
        )
        if (dataValueIndex !== -1) {
            dataValues[dataValueIndex] = {
                dataElement: styleDataItem.id,
                value: feature.properties.value,
            }
        } else {
            dataValues.push({
                dataElement: styleDataItem.id,
                value: feature.properties.value,
            })
        }
    }

    const geometrySource = feature.properties[EVENT_COORDINATE_GEOMETRY_SOURCE]
    const coordinateFieldLabel = geometrySource
        ? resolveGeometrySourceName(geometrySource, geometrySourceNames)
        : eventCoordinateFieldName || i18n.t('Event location')

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
                                orgUnitNames,
                                keyAnalysisDigitGroupSeparator,
                            })}
                        {type === 'Point' && (
                            <tr>
                                <th>{coordinateFieldLabel}</th>
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
    geometrySourceNames: PropTypes.object,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    styleDataItem: PropTypes.object,
}

export default EventPopup
