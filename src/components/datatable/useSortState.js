import { useCallback, useReducer } from 'react'
import { SORT_ASCENDING } from '../../constants/dataTable.js'
import { getNextSorting } from '../../util/dataTable.js'

export const useSortState = (initialSortField = 'name') => {
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        { sortField: initialSortField, sortDirection: SORT_ASCENDING }
    )

    const sortData = useCallback(
        ({ name }) => {
            setSorting(
                getNextSorting(
                    name,
                    { sortField, sortDirection },
                    { defaultSortField: initialSortField }
                )
            )
        },
        [sortField, sortDirection, initialSortField]
    )

    return { sortField, sortDirection, sortData }
}
