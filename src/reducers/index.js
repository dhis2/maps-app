import { combineReducers } from 'redux'
import aggregations from './aggregations.js'
import analyticalObject from './analyticalObject.js'
import basemaps from './basemaps.js'
import contextMenu from './contextMenu.js'
import dataDownload from './dataDownload.js'
import dataElementGroups from './dataElementGroups.js'
import dataElementOperands from './dataElementOperands.js'
import dataElements from './dataElements.js'
import dataSets from './dataSets.js'
import dataTable from './dataTable.js'
import dimensions from './dimensions.js'
import download from './download.js'
import feature from './feature.js'
import indicatorGroups from './indicatorGroups.js'
import indicators from './indicators.js'
import interpretation from './interpretation.js'
import layerEdit from './layerEdit.js'
import layers from './layers.js'
import legendSets from './legendSets.js'
import map from './map.js'
import optionSets from './optionSets.js'
import orgUnitGroups from './orgUnitGroups.js'
import orgUnitGroupSets from './orgUnitGroupSets.js'
import orgUnitLevels from './orgUnitLevels.js'
import orgUnitProfile from './orgUnitProfile.js'
import orgUnitTree from './orgUnitTree.js'
import programDataElements from './programDataElements.js'
import programIndicators from './programIndicators.js'
import programs from './programs.js'
import programStageDataElements from './programStageDataElements.js'
import programStages from './programStages.js'
import programTrackedEntityAttributes from './programTrackedEntityAttributes.js'
import trackedEntityTypes from './trackedEntityTypes.js'
import ui from './ui.js'

export default combineReducers({
    aggregations,
    analyticalObject,
    basemaps,
    contextMenu,
    dataElements,
    dataElementGroups,
    dataElementOperands,
    dataSets,
    dataTable,
    dimensions,
    download,
    indicators,
    indicatorGroups,
    interpretation,
    layerEdit,
    layers,
    legendSets,
    map,
    optionSets,
    orgUnitProfile,
    orgUnitTree,
    orgUnitGroupSets,
    orgUnitGroups,
    orgUnitLevels,
    programs,
    programDataElements,
    programIndicators,
    programStages,
    programStageDataElements,
    programTrackedEntityAttributes,
    ui,
    trackedEntityTypes,
    dataDownload,
    feature,
})
