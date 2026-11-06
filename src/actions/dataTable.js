import * as types from '../constants/actionTypes.js'

export const closeDataTable = () => ({
    type: types.DATA_TABLE_CLOSE,
})

export const toggleDataTable = (id) => ({
    type: types.DATA_TABLE_TOGGLE,
    id,
})

export const resizeDataTable = (height) => ({
    type: types.DATA_TABLE_RESIZE,
    height,
})

export const setDataTableColumnConfig = (layerId, config) => ({
    type: types.DATA_TABLE_COLUMN_CONFIG_SET,
    layerId,
    config,
})

export const setActiveTimelinePeriod = (period) => ({
    type: types.ACTIVE_TIMELINE_PERIOD_SET,
    period,
})
