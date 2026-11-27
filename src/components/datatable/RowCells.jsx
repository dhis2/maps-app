import { DataTableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { RENDERER_ICON } from '../../constants/dataTable.js'
import { getRowId, isMonospaceColumn } from '../../util/dataTable.js'
import CellValue from './CellValue.jsx'
import styles from './styles/DataTable.module.css'

const RowCells = ({
    row,
    visibleHeaders,
    hoveredFeature,
    layerId,
    rendererByDataKey,
    typeByDataKey,
    keyAnalysisDigitGroupSeparator,
    orgUnitIdToName,
}) => {
    const rowId = getRowId(row)
    const isHovered =
        !!rowId &&
        hoveredFeature?.id === rowId &&
        hoveredFeature?.layerId === layerId

    const cellsByDataKey = new Map(row.map((cell) => [cell.dataKey, cell]))
    // Legend and Icon cells show the class icon or color, as the legend in the layer card
    const legendSymbol = {
        iconUrl: cellsByDataKey.get('iconUrl')?.value,
        color: cellsByDataKey.get('color')?.value,
    }

    return (
        <>
            {visibleHeaders.map(({ dataKey }) => {
                const cell = cellsByDataKey.get(dataKey)
                if (!cell) {
                    return null
                }
                const { value, align } = cell
                const renderer = rendererByDataKey.get(dataKey)
                return (
                    <DataTableCell
                        key={`dtcell-${dataKey}`}
                        staticStyle
                        className={cx(styles.dataCell, {
                            [styles.monoCell]: isMonospaceColumn({
                                dataKey,
                                renderer,
                            }),
                            [styles.hovered]: isHovered,
                        })}
                        align={align}
                    >
                        <CellValue
                            value={value}
                            renderer={renderer}
                            type={typeByDataKey.get(dataKey)}
                            legendSymbol={
                                dataKey === 'legend' ||
                                renderer === RENDERER_ICON
                                    ? legendSymbol
                                    : undefined
                            }
                            orgUnitIdToName={orgUnitIdToName}
                            keyAnalysisDigitGroupSeparator={
                                keyAnalysisDigitGroupSeparator
                            }
                        />
                    </DataTableCell>
                )
            })}
        </>
    )
}

RowCells.propTypes = {
    rendererByDataKey: PropTypes.instanceOf(Map).isRequired,
    row: PropTypes.array.isRequired,
    typeByDataKey: PropTypes.instanceOf(Map).isRequired,
    visibleHeaders: PropTypes.array.isRequired,
    hoveredFeature: PropTypes.object,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    layerId: PropTypes.string,
    orgUnitIdToName: PropTypes.object,
}

export default RowCells
