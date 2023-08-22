import { FALLBACK_BASEMAP_ID } from './basemaps.js'

export const apiVersion = 40

export const DEFAULT_SYSTEM_SETTINGS = {
    keyDefaultBaseMap: FALLBACK_BASEMAP_ID,
}

export const SYSTEM_SETTINGS = [
    'keyAnalysisRelativePeriod',
    'keyBingMapsApiKey',
    'keyHideDailyPeriods',
    'keyHideWeeklyPeriods',
    'keyHideBiWeeklyPeriods',
    'keyHideMonthlyPeriods',
    'keyHideBiMonthlyPeriods',
    'keyDefaultBaseMap',
    'keyAnalysisDisplayProperty',
]
