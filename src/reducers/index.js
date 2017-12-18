import { combineReducers } from 'redux';
import basemaps from './basemaps';
import contextMenu from './contextMenu';
import dataElements from './dataElements';
import dataElementGroups from './dataElementGroups';
import dataSets from './dataSets';
import dataTable from './dataTable';
import earthEngine from './earthEngine';
import layerEdit from './layerEdit';
import indicators from './indicators';
import indicatorGroups from './indicatorGroups';
import legendSets from './legendSets';
import loading from './loading';
import map from './map';
import optionSets from './optionSets';
import orgUnit from './orgUnit';
import orgUnitTree from './orgUnitTree';
import orgUnitGroups from './orgUnitGroups';
import orgUnitGroupSets from './orgUnitGroupSets';
import orgUnitLevels from './orgUnitLevels';
import overlays from './overlays';
import programs from './programs';
import programIndicators from './programIndicators';
import programStages from './programStages';
import programStageDataElements from './programStageDataElements';
import programTrackedEntityAttributes from './programTrackedEntityAttributes';
import relocate from './relocate';
import ui from './ui';
import userSettings from './userSettings';

export default combineReducers({
    basemaps,
    contextMenu,
    dataElements,
    dataElementGroups,
    dataSets,
    dataTable,
    earthEngine,
    indicators,
    indicatorGroups,
    layerEdit,
    legendSets,
    loading,
    map,
    optionSets,
    orgUnit,
    orgUnitTree,
    orgUnitGroupSets,
    orgUnitGroups,
    orgUnitLevels,
    overlays,
    programs,
    programIndicators,
    programStages,
    programStageDataElements,
    programTrackedEntityAttributes,
    relocate,
    ui,
    userSettings,
});