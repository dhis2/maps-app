import PropTypes from 'prop-types'
import React from 'react'
import { Column } from 'react-virtualized'
import { getPrecision } from '../../util/earthEngine.js'
import { numberPrecision } from '../../util/numbers.js'
import ColumnHeader from './ColumnHeader.js'

const FeatureColumns = ({ data }) => {
    const fields = Object.keys(data[0]).map((name) => ({
        name,
        type: typeof data[0][name],
    }))

    // TODO: Remove slice
    return fields.slice(0, 10).map(({ name, type }) => {
        const isString = type.includes('String')
        const precision = getPrecision(data.map((d) => d[name]))
        const valueFormat = numberPrecision(precision)

        return (
            <Column
                key={name}
                dataKey={name}
                label={name}
                width={100}
                className="right"
                headerRenderer={(props) => (
                    <ColumnHeader
                        type={isString ? 'string' : 'number'}
                        {...props}
                    />
                )}
                cellRenderer={
                    !isString
                        ? (d) =>
                              d.cellData !== undefined
                                  ? valueFormat(d.cellData)
                                  : ''
                        : undefined
                }
            />
        )
    })
}

FeatureColumns.propTypes = {
    data: PropTypes.array.isRequired,
}

export default FeatureColumns
