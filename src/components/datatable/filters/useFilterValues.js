import { useMemo } from 'react'
import { RENDERER_ICON, TYPE_NUMBER } from '../../../constants/dataTable.js'
import useOptionSet from '../../../hooks/useOptionSet.js'
import { isNamedValueColumn } from '../../../util/dataTable.js'
import {
    countColumnValues,
    getRowsForColumn,
} from '../../../util/filterValues.js'
import { formatCellText } from '../../../util/tableCells.js'

// The open column's values, labelled as its cells, counted once when its popover opens:
// over all rows (to apply a condition on names) and over the rows the other filters keep
const useFilterValues = ({
    header,
    rows,
    filters,
    orgUnitIdToName,
    keyAnalysisDigitGroupSeparator,
    sortField,
    sortDirection,
    legendItems,
}) => {
    const { optionSet } = useOptionSet(header.optionSet?.id)
    const sorting = useMemo(
        () => ({ sortField, sortDirection, idToName: orgUnitIdToName }),
        [sortField, sortDirection, orgUnitIdToName]
    )
    const matchOnLabel = isNamedValueColumn(header)

    const getLabel = useMemo(() => {
        const { renderer, type } = header
        const optionNames = new Map(
            optionSet?.options.map(({ code, name }) => [code, name])
        )
        return (value) => {
            // Icons by their file name, without its extension
            if (renderer === RENDERER_ICON) {
                return String(value)
                    .split('/')
                    .pop()
                    .replace(/\.[^.]+$/, '')
            }
            return (
                optionNames.get(String(value)) ??
                formatCellText(type === TYPE_NUMBER ? Number(value) : value, {
                    renderer,
                    type,
                    orgUnitIdToName,
                    keyAnalysisDigitGroupSeparator,
                })
            )
        }
    }, [header, optionSet, orgUnitIdToName, keyAnalysisDigitGroupSeparator])

    const allValues = useMemo(
        () =>
            countColumnValues(rows, {
                header,
                getLabel,
                byLabel: matchOnLabel,
                sorting,
                legendItems,
            }),
        [rows, header, getLabel, matchOnLabel, sorting, legendItems]
    )

    const values = useMemo(
        () =>
            countColumnValues(getRowsForColumn(rows, filters, header.dataKey), {
                header,
                getLabel,
                byLabel: matchOnLabel,
                sorting,
                legendItems,
            }),
        [rows, filters, header, getLabel, matchOnLabel, sorting, legendItems]
    )

    return { allValues, values, matchOnLabel }
}

export default useFilterValues
