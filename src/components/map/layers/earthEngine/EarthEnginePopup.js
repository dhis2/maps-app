import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { getEarthEngineAggregationType } from '../../../../constants/aggregationTypes.js'
import { hasClasses } from '../../../../util/earthEngine.js'
import {
    getRoundToPrecisionFn,
    getPrecision,
} from '../../../../util/numbers.js'
import Popup from '../../Popup.js'
import styles from './styles/EarthEnginePopup.module.css'

const EarthEnginePopup = (props) => {
    const { coordinates, feature, data, legend, valueType, onClose } = props
    const { id, name } = feature.properties
    const { title, period = '', unit, items = [], groups } = legend
    const values = typeof data === 'object' ? data[id] : null
    const classes = hasClasses(valueType)
    const isPercentage = valueType === 'percentage'
    const isLoading = data === 'loading'
    let table = null

    if (values) {
        if (classes) {
            const valueFormat = getRoundToPrecisionFn(isPercentage ? 2 : 0)

            table = (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th colSpan="2">
                                {title} {period}
                            </th>
                            <th>{valueType}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items
                            .filter((i) => values[i.value])
                            .sort((a, b) => values[b.value] - values[a.value])
                            .map(({ value, name, color }) => (
                                <tr key={value} className={styles.classes}>
                                    <th
                                        style={{
                                            backgroundColor: color,
                                        }}
                                    ></th>
                                    <th>{name}</th>
                                    <td>
                                        {valueFormat(values[value])}
                                        {isPercentage ? '%' : ''}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )
        } else {
            const onlySum = valueType.length === 1 && valueType[0] === 'sum'

            // Returns the value key for a type/group
            const getValueKey = (type, group) =>
                groups.length === 1
                    ? type
                    : valueType.length === 1
                    ? group
                    : `${group}_${type}`

            // Returns the value format (precision) for an aggregation type
            const getValueFormat = (type) =>
                getRoundToPrecisionFn(
                    getPrecision(
                        Object.values(data)
                            .map((ou) =>
                                Object.keys(ou)
                                    .filter((key) => key.includes(type))
                                    .map((key) => ou[key])
                            )
                            .flat()
                    )
                )

            // Create value format function for each aggregation type
            const typeValueFormat = valueType.reduce((types, type) => {
                types[type] = getValueFormat(type)
                return types
            }, {})

            const header = (
                <caption>
                    {title}
                    <br />
                    {period}
                    {!onlySum && <div className={styles.unit}>{unit}</div>}
                </caption>
            )

            if (groups) {
                table = (
                    <table className={styles.table}>
                        {header}
                        <thead>
                            <tr>
                                <th>Group</th>
                                {valueType.map((type) => (
                                    <th key={type}>
                                        {getEarthEngineAggregationType(type)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(({ id, name }) => (
                                <tr key={id}>
                                    <th>{name}</th>
                                    {valueType.map((type) => (
                                        <td key={type}>
                                            {typeValueFormat[type](
                                                values[getValueKey(type, id)]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {groups.length > 1 && (
                            <tfoot>
                                <tr>
                                    <th>{i18n.t('All groups')}</th>
                                    {valueType.map((type) => (
                                        <td key={type}>
                                            {typeValueFormat[type](
                                                values[type]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                )
            } else {
                table = (
                    <table className={styles.table}>
                        {header}
                        <tbody>
                            {valueType.map((type) => (
                                <tr key={type}>
                                    <th>
                                        {getEarthEngineAggregationType(type)}:
                                    </th>
                                    <td>
                                        {typeValueFormat[type](values[type])}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        }
    }

    return (
        <Popup
            coordinates={coordinates}
            orgUnitId={id}
            onClose={onClose}
            className="dhis2-map-popup-orgunit"
        >
            <div className={styles.popup}>
                <div className={styles.title}>{name}</div>
                {table}
                {isLoading && (
                    <div className={styles.loading}>
                        <CircularLoader small />
                        {i18n.t('Loading data')}
                    </div>
                )}
            </div>
        </Popup>
    )
}

EarthEnginePopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    valueType: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
}

export default EarthEnginePopup
