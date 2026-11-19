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
}) => {
    const { optionSet } = useOptionSet(header.optionSet?.id)
    const matchOnLabel = isNamedValueColumn(header)

    const getLabel = useMemo(() => {
        const { renderer, type } = header
        const optionNames = new Map(
            optionSet?.options.map(({ code, name }) => [code, name])
        )
        return (value, row) => {
            // Icons stand for a group: list them by its name
            if (renderer === RENDERER_ICON) {
                return row.group ?? String(value).split('/').pop()
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
            }),
        [rows, header, getLabel, matchOnLabel]
    )

    const values = useMemo(
        () =>
            countColumnValues(getRowsForColumn(rows, filters, header.dataKey), {
                header,
                getLabel,
                byLabel: matchOnLabel,
            }),
        [rows, filters, header, getLabel, matchOnLabel]
    )

    return { allValues, values, matchOnLabel }
}

export default useFilterValues
