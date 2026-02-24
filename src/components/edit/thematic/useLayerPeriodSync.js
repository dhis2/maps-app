import { useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPeriods } from '../../../actions/layerEdit.js'
import { periodsSync } from '../../../actions/map.js'
import {
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../../constants/layers.js'

const useInitialSelector = (selector) => {
    const selectedValue = useSelector(selector)
    const ref = useRef(selectedValue)
    return ref.current
}

export const useLayerPeriodSync = () => {
    const dispatch = useDispatch()
    const mapViews = useSelector((state) => state.map.mapViews)
    const renderingStrategy = useInitialSelector(
        (state) => state.layerEdit.renderingStrategy
    )

    const strategyFiltersMap = useMemo(() => {
        const map = {}
        for (const mv of mapViews) {
            if (mv.renderingStrategy) {
                map[mv.renderingStrategy] = mv.filters
            }
        }
        return map
    }, [mapViews])

    const hasTimelineLayer = useMemo(
        () => !!strategyFiltersMap[RENDERING_STRATEGY_TIMELINE],
        [strategyFiltersMap]
    )
    const hasSplitLayer = useMemo(
        () => !!strategyFiltersMap[RENDERING_STRATEGY_SPLIT_BY_PERIOD],
        [strategyFiltersMap]
    )

    const defaultRenderingStrategy = useMemo(() => {
        if (hasTimelineLayer) {
            return RENDERING_STRATEGY_TIMELINE
        }
        if (hasSplitLayer) {
            return RENDERING_STRATEGY_SPLIT_BY_PERIOD
        }
        return undefined // component can choose fallback
    }, [hasTimelineLayer, hasSplitLayer])

    const shouldSyncFromOtherLayers = useMemo(() => {
        return renderingStrategy === RENDERING_STRATEGY_TIMELINE ||
            renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD
            ? false
            : hasTimelineLayer || hasSplitLayer
    }, [hasTimelineLayer, hasSplitLayer, renderingStrategy])

    const getPeriodsForStrategy = useCallback(
        ({ renderingStrategy }) => {
            const filters = strategyFiltersMap[renderingStrategy]
            if (!filters?.[0]?.items?.length) {
                return null
            }
            return filters[0].items
        },
        [strategyFiltersMap]
    )

    const syncFromOtherLayers = useCallback(
        ({ renderingStrategy }) => {
            const periods = getPeriodsForStrategy({ renderingStrategy })
            if (!periods) {
                return false
            }

            dispatch(setPeriods(periods))
            return true
        },
        [getPeriodsForStrategy, dispatch]
    )

    const syncToOtherLayers = useCallback(
        ({ periods, renderingStrategy }) => {
            const filters = strategyFiltersMap[renderingStrategy]
            if (!filters) {
                return false
            }

            dispatch(periodsSync(periods, renderingStrategy))
            return true
        },
        [strategyFiltersMap, dispatch]
    )

    return {
        defaultRenderingStrategy,
        shouldSyncFromOtherLayers,
        syncFromOtherLayers,
        syncToOtherLayers,
    }
}
