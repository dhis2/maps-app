import { DEFAULT_BASEMAP_ID } from './basemaps';

export const apiVersion = 37;

export const DEFAULT_SYSTEM_SETTINGS = {
    keyDefaultBaseMap: 'openStreetMap', //DEFAULT_BASEMAP_ID
};

export const SYSTEM_SETTINGS = [
    'keyAnalysisRelativePeriod',
    'keyBingMapsApiKey',
    'keyHideDailyPeriods',
    'keyHideWeeklyPeriods',
    'keyHideBiWeeklyPeriods',
    'keyHideMonthlyPeriods',
    'keyHideBiMonthlyPeriods',
    'keyDefaultBaseMap',
];
