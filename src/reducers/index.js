import { combineReducers } from 'redux'
import aggregations from './aggregations.js'
import analyticalObject from './analyticalObject.js'
import basemaps from './basemaps.js'
import climate from './climate.js'
import contextMenu from './contextMenu.js'
import dataTable from './dataTable.js'
import download from './download.js'
import feature from './feature.js'
import interpretation from './interpretation.js'
import layerEdit from './layerEdit.js'
import layers from './layers.js'
import map from './map.js'
import orgUnitProfile from './orgUnitProfile.js'
import ui from './ui.js'

export default combineReducers({
    aggregations,
    analyticalObject,
    basemaps,
    climate,
    contextMenu,
    dataTable,
    download,
    interpretation,
    layerEdit,
    layers,
    map,
    orgUnitProfile,
    ui,
    feature,
})
