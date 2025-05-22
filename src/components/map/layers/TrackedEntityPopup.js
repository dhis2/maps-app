import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import {
    formatDatetime,
    formatCoordinate,
    formatValueForDisplay,
} from '../../../util/helpers.js'
import { ORG_UNIT_QUERY } from '../../../util/orgUnits.js'
import Popup from '../Popup.js'
import styles from './styles/Popup.module.css'

const TRACKED_ENTITIES_QUERY = {
    trackedEntities: {
        resource: `tracker/trackedEntities`,
        id: ({ id }) => id,
        params: ({ program }) => ({
            fields: 'updatedAt,orgUnit,attributes[displayName~rename(name),value,attribute],relationships',
            program: program?.id,
        }),
    },
}

const getDataRows = ({ displayAttributes, attributes }) => {
    const dataRows = []

    // Include rows for each displayInList attribute
    displayAttributes.forEach(({ id, name, valueType, options }) => {
        const { value } = attributes.find((d) => d.attribute === id) || {}
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

// Will display a popup for an trackeentity feature
const TrackedEntityPopup = ({
    coordinates,
    feature,
    activeDataSource,
    program,
    nameProperty,
    displayAttributes,
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
        error: errorTrackedEntity,
        data: dataTrackedEntity,
        refetch: refetchTrackedEntity,
        fetching: fetchingTrackedEntity,
    } = useDataQuery(TRACKED_ENTITIES_QUERY, {
        variables: {
            id: feature.properties.id,
            program,
        },
        lazy: true,
    })

    useEffect(() => {
        const fetchTEandOU = async () => {
            const resultTrackedEntity = await refetchTrackedEntity({
                id: feature.properties.id,
            })
            const idOrgUnit = resultTrackedEntity?.trackedEntities?.orgUnit

            if (idOrgUnit) {
                const resultOrgUnit = await refetchOrgUnit({
                    id: idOrgUnit,
                    nameProperty,
                })
                const nameOrgUnit = resultOrgUnit?.orgUnit?.name

                setOrgUnit(nameOrgUnit)
            }
        }
        fetchTEandOU()
    }, [feature, nameProperty, refetchTrackedEntity, refetchOrgUnit])

    const { type, coordinates: coord } = feature.geometry
    const { attributes = [], updatedAt } =
        dataTrackedEntity?.trackedEntities || {}

    return (
        <Popup coordinates={coordinates} onClose={onClose}>
            <div className={styles.trackedEntityPopup}>
                {errorTrackedEntity && (
                    <table>
                        <tbody>
                            <tr>
                                {i18n.t(
                                    'Could not retrieve tracked entity data'
                                )}
                            </tr>
                            <tr key="divider" className={styles.divider} />
                        </tbody>
                    </table>
                )}
                {!fetchingTrackedEntity && !fetchingOrgUnit && (
                    <table>
                        <tbody>
                            {dataTrackedEntity?.trackedEntities &&
                                activeDataSource == 'primary' &&
                                getDataRows({
                                    displayAttributes,
                                    attributes,
                                })}
                            {type === 'Point' && (
                                <tr>
                                    <th>{i18n.t('Tracked entity location')}</th>
                                    <td>{formatCoordinate(coord)}</td>
                                </tr>
                            )}
                            {orgUnit && (
                                <tr>
                                    <th>{i18n.t('Organisation unit')}</th>
                                    <td>{orgUnit}</td>
                                </tr>
                            )}
                            {updatedAt && (
                                <tr>
                                    <th>{i18n.t('Last updated')}</th>
                                    <td>{formatDatetime(updatedAt)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </Popup>
    )
}

TrackedEntityPopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    displayAttributes: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    nameProperty: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    activeDataSource: PropTypes.string,
    program: PropTypes.object,
}

export default TrackedEntityPopup
