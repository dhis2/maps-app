import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPeriods } from '../../../actions/layerEdit.js'
import { periodsSync } from '../../../actions/map.js'
import {
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../../constants/layers.js'

export const useLayerPeriodSync = () => {
    const dispatch = useDispatch()
    const mapViews = useSelector((state) => state.map.mapViews)

    const strategyFiltersMap = useMemo(() => {
        const map = {}
        for (const mv of mapViews) {
            if (mv.renderingStrategy) {
                map[mv.renderingStrategy] = mv.filters
            }
        }
        return map
    }, [mapViews])

    const defaultRenderingStrategy = useMemo(() => {
        if (strategyFiltersMap[RENDERING_STRATEGY_TIMELINE]) {
            return RENDERING_STRATEGY_TIMELINE
        } else if (strategyFiltersMap[RENDERING_STRATEGY_SPLIT_BY_PERIOD]) {
            return RENDERING_STRATEGY_SPLIT_BY_PERIOD
        } else {
            return undefined // component can choose fallback
        }
    }, [strategyFiltersMap])

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
        syncFromOtherLayers,
        syncToOtherLayers,
        defaultRenderingStrategy,
    }
}
