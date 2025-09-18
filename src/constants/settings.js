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
]

export const MAPS_ADMIN_AUTHORITY_IDS = [
    'ALL',
    'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD',
]

export const MAPS_APP_NAMESPACE = 'DHIS2_MAPS_APP_CORE'
export const MAPS_APP_KEY_MANAGED_LAYER_SOURCES = 'MANAGED_LAYER_SOURCES'
