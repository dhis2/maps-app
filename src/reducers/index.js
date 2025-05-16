import { combineReducers } from 'redux'
import aggregations from './aggregations.js'
import analyticalObject from './analyticalObject.js'
import contextMenu from './contextMenu.js'
import dataTable from './dataTable.js'
import download from './download.js'
import feature from './feature.js'
import featureProfile from './featureProfile.js'
import interpretation from './interpretation.js'
import layerEdit from './layerEdit.js'
import layerSources from './layerSources.js'
import map from './map.js'
import orgUnitProfile from './orgUnitProfile.js'
import ui from './ui.js'

export default combineReducers({
    aggregations,
    analyticalObject,
    contextMenu,
    dataTable,
    download,
    interpretation,
    layerEdit,
    layerSources,
    map,
    orgUnitProfile,
    ui,
    feature,
    featureProfile,
})
