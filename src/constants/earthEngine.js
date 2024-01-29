import buildings from './earthEngineLayers/buildings_GOOGLE.js'
import elevation from './earthEngineLayers/elevation_SRTM.js'
import landcover from './earthEngineLayers/landcover_MCD12Q1.js'
import legacyNighttime from './earthEngineLayers/legacy/nighttime_DMSP-OLS.js'
import legacyPopulationWorldPop from './earthEngineLayers/legacy/population_WorldPop.js'
import legacyPopulation100m from './earthEngineLayers/legacy/population_WorldPop_100m.js'
import legacyPrecipitation from './earthEngineLayers/legacy/precipitation_pentad_CHIRPS.js'
import legacyTemperature from './earthEngineLayers/legacy/temperature_MOD11A2v061.js'
import populationAgeSex from './earthEngineLayers/population_age_sex_WorldPop.js'
import populationTotal from './earthEngineLayers/population_total_WorldPop.js'
import precipitationMonthly from './earthEngineLayers/precipitation_monthly_ERA5-Land.js'
import temperatureMonthly from './earthEngineLayers/temperature_monthly_ERA5-Land.js'

export const earthEngineLayers = [
    populationTotal,
    populationAgeSex,
    buildings,
    elevation,
    precipitationMonthly,
    temperatureMonthly,
    landcover,
    legacyNighttime,
    legacyPopulation100m,
    legacyPopulationWorldPop,
    legacyPrecipitation,
    legacyTemperature,
]

export const getEarthEngineLayer = (id) =>
    earthEngineLayers.find((l) => l.layerId === id)
