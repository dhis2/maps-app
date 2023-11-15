import PropTypes from 'prop-types'
import React from 'react'
import { Column } from 'react-virtualized'
import { hasClasses, getPrecision } from '../../util/earthEngine.js'
import { numberPrecision } from '../../util/numbers.js'
import ColumnHeader from './ColumnHeader.js'

const EarthEngineColumns = ({ aggregationType, legend, data }) => {
    const { title, items } = legend

    if (hasClasses(aggregationType) && items) {
        const valueFormat = numberPrecision(2)

        return items.map(({ id, name }) => (
            <Column
                key={id}
                dataKey={String(id)}
                label={name}
                width={100}
                className="right"
                headerRenderer={(props) => (
                    <ColumnHeader type="number" {...props} />
                )}
                cellRenderer={(d) =>
                    d.cellData !== undefined ? valueFormat(d.cellData) : ''
                }
            />
        ))
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        return aggregationType.map((type) => {
            const label = `${type} ${title}`.toUpperCase() // Already translated
            const precision = getPrecision(data.map((d) => d[type]))
            const valueFormat = numberPrecision(precision)

            return (
                <Column
                    key={type}
                    dataKey={type}
                    label={label}
                    width={100}
                    className="right"
                    headerRenderer={(props) => (
                        <ColumnHeader type="number" {...props} />
                    )}
                    cellRenderer={(d) =>
                        d.cellData !== undefined && d.cellData !== null
                            ? valueFormat(d.cellData)
                            : ''
                    }
                />
            )
        })
    }

    return null
}

EarthEngineColumns.propTypes = {
    aggregationType: PropTypes.array,
    aggregations: PropTypes.object,
    classes: PropTypes.bool,
    data: PropTypes.array,
    legend: PropTypes.object,
}

export default EarthEngineColumns
