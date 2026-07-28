import { useCallback, useMemo } from 'react'

export const getReversedSelection = (selectedIds, allRowIds) => {
    const selectedIdSet = new Set(selectedIds)
    const allRowIdSet = new Set(allRowIds)
    const offViewSelected = selectedIds.filter((id) => !allRowIdSet.has(id))
    const invertedVisible = allRowIds.filter((id) => !selectedIdSet.has(id))
    return [...offViewSelected, ...invertedVisible]
}

// onChange receives the full next selection (possibly empty) - the caller
// decides how to apply it (dispatch to a single layer's Redux selection,
// set local state, etc), so this hook has no opinion on where selection
// state actually lives.
export const useRowSelection = ({
    selectedIds,
    selectedIdSet,
    allRowIds,
    onChange,
}) => {
    const allRowIdSet = useMemo(() => new Set(allRowIds), [allRowIds])

    const isAllSelected = useMemo(
        () =>
            allRowIds.length > 0 &&
            allRowIds.every((id) => selectedIdSet.has(id)),
        [allRowIds, selectedIdSet]
    )

    const onToggleSelectAll = useCallback(() => {
        const nextIds = isAllSelected
            ? selectedIds.filter((id) => !allRowIdSet.has(id))
            : [...new Set([...selectedIds, ...allRowIds])]

        onChange(nextIds)
    }, [isAllSelected, allRowIds, allRowIdSet, selectedIds, onChange])

    const onReverseSelection = useCallback(() => {
        onChange(getReversedSelection(selectedIds, allRowIds))
    }, [selectedIds, allRowIds, onChange])

    return {
        isAllSelected,
        onToggleSelectAll,
        onReverseSelection,
    }
}
