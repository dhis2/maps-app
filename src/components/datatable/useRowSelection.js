import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { selectAllFeatures, clearSelection } from '../../actions/selection.js'

export const getReversedSelection = (selectedIds, allRowIds) => {
    const selectedIdSet = new Set(selectedIds)
    const allRowIdSet = new Set(allRowIds)
    const offViewSelected = selectedIds.filter((id) => !allRowIdSet.has(id))
    const invertedVisible = allRowIds.filter((id) => !selectedIdSet.has(id))
    return [...offViewSelected, ...invertedVisible]
}

export const useRowSelection = ({
    selectedIds,
    selectedIdSet,
    allRowIds,
    layerId,
}) => {
    const dispatch = useDispatch()

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

        if (nextIds.length) {
            dispatch(selectAllFeatures(nextIds, layerId))
        } else {
            dispatch(clearSelection())
        }
    }, [dispatch, isAllSelected, allRowIds, allRowIdSet, selectedIds, layerId])

    const onReverseSelection = useCallback(() => {
        const nextIds = getReversedSelection(selectedIds, allRowIds)

        if (nextIds.length) {
            dispatch(selectAllFeatures(nextIds, layerId))
        } else {
            dispatch(clearSelection())
        }
    }, [dispatch, selectedIds, allRowIds, layerId])

    return {
        isAllSelected,
        onToggleSelectAll,
        onReverseSelection,
    }
}
