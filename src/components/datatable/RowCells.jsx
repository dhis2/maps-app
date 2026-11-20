import { DataTableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    RENDERER_COLOR,
    ORG_UNIT_ID_DATA_KEY,
} from '../../constants/dataTable.js'
import { isDarkColor } from '../../util/colors.js'
import { getRowId } from '../../util/dataTable.js'
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

    return (
        <>
            {visibleHeaders.map(({ dataKey }) => {
                const cell = cellsByDataKey.get(dataKey)
                if (!cell) {
                    return null
                }
                const { value, align } = cell
                const renderer = rendererByDataKey.get(dataKey)
                const isColorCell = renderer === RENDERER_COLOR
                return (
                    <DataTableCell
                        key={`dtcell-${dataKey}`}
                        staticStyle
                        className={cx(styles.dataCell, {
                            [styles.lightText]:
                                isColorCell && isDarkColor(value),
                            [styles.monoCell]:
                                dataKey === 'id' ||
                                dataKey === ORG_UNIT_ID_DATA_KEY ||
                                isColorCell,
                            [styles.hovered]: isHovered && !isColorCell,
                        })}
                        backgroundColor={isColorCell ? value : null}
                        align={align}
                    >
                        <CellValue
                            value={value}
                            renderer={renderer}
                            type={typeByDataKey.get(dataKey)}
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
