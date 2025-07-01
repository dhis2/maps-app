import { FALLBACK_BASEMAP_ID } from './basemaps.js'
import { KEYS_VALIDATION } from './layers.js'

export const apiVersion = 40

export const DEFAULT_SYSTEM_SETTINGS = {
    keyDefaultBaseMap: FALLBACK_BASEMAP_ID,
}

export const SYSTEM_SETTINGS = [
    'keyAnalysisRelativePeriod',
    'keyHideDailyPeriods',
    'keyHideWeeklyPeriods',
    'keyHideBiWeeklyPeriods',
    'keyHideMonthlyPeriods',
    'keyHideBiMonthlyPeriods',
    'keyDefaultBaseMap',
    ...Object.keys(KEYS_VALIDATION),
]

export const MAPS_ADMIN_AUTHORITY_IDS = [
    'ALL',
    'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD',
]

export const MAPS_APP_NAMESPACE = 'DHIS2_MAPS_APP_CORE'
export const MAPS_APP_KEY_MANAGED_LAYER_SOURCES = 'MANAGED_LAYER_SOURCES'
