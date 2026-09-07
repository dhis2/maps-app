import { DataTableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    TYPE_DATE,
} from '../../constants/dataTable.js'
import { isDarkColor } from '../../util/colors.js'
import { getRowId } from '../../util/dataTable.js'
import { formatDate, formatDatetime } from '../../util/helpers.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { getPinnedCellProps } from '../../util/tableColumns.js'
import styles from './styles/DataTable.module.css'

const RowCells = ({
    row,
    visibleHeaders,
    selectedIdSet,
    hoveredFeature,
    layerId,
    isCheckboxColumnPinned,
    pinnedLeftOffsets,
    pinnedColumnCount,
    columnWidths,
    rendererByDataKey,
    typeByDataKey,
    keyAnalysisDigitGroupSeparator,
    onToggleSelection,
}) => {
    const rowId = getRowId(row)
    const isSelected = !!rowId && selectedIdSet.has(rowId)
    const isHovered =
        !!rowId &&
        hoveredFeature?.id === rowId &&
        hoveredFeature?.layerId === layerId

    const cellsByDataKey = new Map(row.map((cell) => [cell.dataKey, cell]))

    return (
        <>
            <DataTableCell
                staticStyle
                fixed={isCheckboxColumnPinned}
                left={isCheckboxColumnPinned ? '0px' : undefined}
                width={isCheckboxColumnPinned ? '76px' : undefined}
                className={cx(styles.checkboxCell, {
                    [styles.selected]: isSelected,
                    [styles.hovered]: isHovered,
                })}
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => rowId && onToggleSelection(rowId)}
                    onClick={(e) => e.stopPropagation()}
                />
            </DataTableCell>
            {visibleHeaders.map(({ dataKey }, index) => {
                const cell = cellsByDataKey.get(dataKey)
                if (!cell) {
                    return null
                }
                const { value, align } = cell
                const { fixed, left, width, isLastPinned } = getPinnedCellProps(
                    dataKey,
                    index,
                    {
                        pinnedLeftOffsets,
                        pinnedColumnCount,
                        columnWidths,
                    }
                )
                const renderer = rendererByDataKey.get(dataKey)
                const isColorCell = renderer === RENDERER_COLOR
                const isIconCell = renderer === RENDERER_ICON
                const isDateCell = renderer === RENDERER_DATE
                const isDateOnlyCell = typeByDataKey.get(dataKey) === TYPE_DATE
                return (
                    <DataTableCell
                        key={`dtcell-${dataKey}`}
                        staticStyle
                        fixed={fixed}
                        left={left}
                        width={width}
                        className={cx(styles.dataCell, {
                            [styles.lightText]:
                                isColorCell && isDarkColor(value),
                            [styles.monoCell]: dataKey === 'id' || isColorCell,
                            [styles.selected]: isSelected && !isColorCell,
                            [styles.hovered]: isHovered && !isColorCell,
                            [styles.pinnedColumnShadow]: isLastPinned,
                        })}
                        backgroundColor={isColorCell ? value : null}
                        align={align}
                    >
                        {isColorCell && value?.toLowerCase()}
                        {isIconCell && value && (
                            <img
                                className={styles.iconCell}
                                src={value}
                                alt=""
                                onError={(e) => {
                                    e.target.style.visibility = 'hidden'
                                }}
                            />
                        )}
                        {isDateCell &&
                            value &&
                            (isDateOnlyCell
                                ? formatDate(value)
                                : formatDatetime(value))}
                        {!isColorCell &&
                            !isIconCell &&
                            !isDateCell &&
                            formatWithSeparator(
                                value,
                                keyAnalysisDigitGroupSeparator
                            )}
                    </DataTableCell>
                )
            })}
        </>
    )
}

RowCells.propTypes = {
    columnWidths: PropTypes.array.isRequired,
    isCheckboxColumnPinned: PropTypes.bool.isRequired,
    pinnedColumnCount: PropTypes.number.isRequired,
    pinnedLeftOffsets: PropTypes.object.isRequired,
    rendererByDataKey: PropTypes.instanceOf(Map).isRequired,
    row: PropTypes.array.isRequired,
    selectedIdSet: PropTypes.instanceOf(Set).isRequired,
    typeByDataKey: PropTypes.instanceOf(Map).isRequired,
    visibleHeaders: PropTypes.array.isRequired,
    onToggleSelection: PropTypes.func.isRequired,
    hoveredFeature: PropTypes.object,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    layerId: PropTypes.string,
}

export default RowCells
