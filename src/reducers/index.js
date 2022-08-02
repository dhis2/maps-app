import { combineReducers } from 'redux';
import aggregations from './aggregations';
import alerts from './alerts';
import analyticalObject from './analyticalObject';
import basemaps from './basemaps';
import contextMenu from './contextMenu';
import dataElements from './dataElements';
import dataElementGroups from './dataElementGroups';
import dataElementOperands from './dataElementOperands';
import dataSets from './dataSets';
import dataTable from './dataTable';
import dimensions from './dimensions';
import download from './download.js';
import layerEdit from './layerEdit';
import indicators from './indicators';
import indicatorGroups from './indicatorGroups';
import layers from './layers';
import legendSets from './legendSets';
import map from './map';
import optionSets from './optionSets';
import orgUnitProfile from './orgUnitProfile';
import orgUnitTree from './orgUnitTree';
import orgUnitGroups from './orgUnitGroups';
import orgUnitGroupSets from './orgUnitGroupSets';
import orgUnitLevels from './orgUnitLevels';
import programs from './programs';
import programDataElements from './programDataElements';
import programIndicators from './programIndicators';
import programStages from './programStages';
import programStageDataElements from './programStageDataElements';
import programTrackedEntityAttributes from './programTrackedEntityAttributes';
import ui from './ui';
import trackedEntityTypes from './trackedEntityTypes';
import dataDownload from './dataDownload';
import feature from './feature';

export default combineReducers({
    aggregations,
    alerts,
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
});
