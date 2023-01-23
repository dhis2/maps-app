import { combineReducers } from 'redux'
import aggregations from './aggregations.js'
import analyticalObject from './analyticalObject.js'
import basemaps from './basemaps.js'
import contextMenu from './contextMenu.js'
import dataTable from './dataTable.js'
import download from './download.js'
import feature from './feature.js'
import interpretation from './interpretation.js'
import layerEdit from './layerEdit.js'
import layers from './layers.js'
import map from './map.js'
import optionSets from './optionSets.js'
import orgUnitProfile from './orgUnitProfile.js'
import orgUnitTree from './orgUnitTree.js'
import programDataElements from './programDataElements.js'
import programIndicators from './programIndicators.js'
import programs from './programs.js'
import programStageDataElements from './programStageDataElements.js'
import programTrackedEntityAttributes from './programTrackedEntityAttributes.js'
import ui from './ui.js'

export default combineReducers({
    aggregations,
    analyticalObject,
    basemaps,
    contextMenu,
    dataTable,
    download,
    interpretation,
    layerEdit,
    layers,
    map,
    optionSets,
    orgUnitProfile,
    orgUnitTree,
    programs,
    programDataElements,
    programIndicators,
    programStageDataElements,
    programTrackedEntityAttributes,
    ui,
    feature,
})
