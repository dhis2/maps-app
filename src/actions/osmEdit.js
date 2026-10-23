import * as types from '../constants/actionTypes.js'

export const startOsmDrawing = (categoryId, start) => ({
    type: types.OSM_DRAWING_START,
    payload: { categoryId, start },
})

// Edits the shape of a stored feature, geometry is its current one
export const startOsmShapeEdit = (categoryId, eventId, geometry) => ({
    type: types.OSM_DRAWING_START,
    payload: { categoryId, eventId, geometry },
})

export const openOsmFeatureForm = (categoryId, geometry) => ({
    type: types.OSM_FEATURE_FORM_OPEN,
    payload: { categoryId, geometry },
})

export const openOsmEditForm = (categoryId, eventId) => ({
    type: types.OSM_FEATURE_FORM_OPEN,
    payload: { categoryId, eventId },
})

export const closeOsmEdit = () => ({
    type: types.OSM_EDIT_CLOSE,
})
