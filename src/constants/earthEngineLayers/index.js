import buildings from './buildings_GOOGLE.js'
import elevation from './elevation_SRTM.js'
import heatDaily from './heat_daily_ERA5-Heat.js'
import heatMonthly from './heat_monthly_ERA5-Heat.js'
import heatWeekly from './heat_weekly_ERA5-Heat.js'
import landcover from './landcover_MCD12Q1.js'
import legacyBuildings from './legacy/buildings_GOOGLE.js'
import legacyNighttime from './legacy/nighttime_DMSP-OLS.js'
import legacyPopulationWorldPop from './legacy/population_WorldPop.js'
import legacyPopulation100m from './legacy/population_WorldPop_100m.js'
import legacyPrecipitation from './legacy/precipitation_pentad_CHIRPS.js'
import legacyTemperature from './legacy/temperature_MOD11A2v061.js'
import populationAgeSex from './population_age_sex_WorldPop.js'
import populationTotal from './population_total_WorldPop.js'
import precipitationDaily from './precipitation_daily_ERA5-Land.js'
import precipitationMonthly from './precipitation_monthly_ERA5-Land.js'
import precipitationWeekly from './precipitation_weekly_ERA5-Land.js'
import temperatureDaily from './temperature_daily_ERA5-Land.js'
import temperatureMonthly from './temperature_monthly_ERA5-Land.js'
import temperatureWeekly from './temperature_weekly_ERA5-Land.js'
import vegetationModisMonthly from './vegetation_monthly_MOD13Q1.js'
import vegetationModisOriginal from './vegetation_original_MOD13Q1.js'
import vegetationModisWeekly from './vegetation_weekly_MOD13Q1.js'

const earthEngineLayers = [
    populationTotal,
    populationAgeSex,
    buildings,
    elevation,
    heatMonthly,
    heatWeekly,
    heatDaily,
    precipitationMonthly,
    precipitationWeekly,
    precipitationDaily,
    temperatureMonthly,
    temperatureWeekly,
    temperatureDaily,
    landcover,
    vegetationModisMonthly,
    vegetationModisOriginal,
    vegetationModisWeekly,
    legacyBuildings,
    legacyNighttime,
    legacyPopulation100m,
    legacyPopulationWorldPop,
    legacyPrecipitation,
    legacyTemperature,
]

const earthEngineLayersDefault = [
    populationTotal,
    populationAgeSex,
    buildings,
    elevation,
    precipitationMonthly,
    temperatureMonthly,
    landcover,
]

export const earthEngineLayersDefaultIds = earthEngineLayersDefault.map(
    (l) => l.layerId
)

export const getEarthEngineLayer = (id) =>
    earthEngineLayers.find((l) => l.layerId === id)

export default earthEngineLayers
