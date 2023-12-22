import buildings from '../components/earthEngine/layers/buildings_GOOGLE.js'
import elevation from '../components/earthEngine/layers/elevation_SRTM.js'
import landcover from '../components/earthEngine/layers/landcover_MCD12Q1.js'
import legacyNighttime from '../components/earthEngine/layers/legacy/nighttime_DMSP-OLS.js'
import legacyPopulationWorldPop from '../components/earthEngine/layers/legacy/population_WorldPop.js'
import legacyPopulation100m from '../components/earthEngine/layers/legacy/population_WorldPop_100m.js'
import legacyPrecipitation from '../components/earthEngine/layers/legacy/precipitation_pentad_CHIRPS.js'
import legacyTemperature from '../components/earthEngine/layers/legacy/temperature_MOD11A2v061.js'
import populationAgeSex from '../components/earthEngine/layers/population_age_sex_WorldPop.js'
import populationTotal from '../components/earthEngine/layers/population_total_WorldPop.js'
import precipitationMonthly from '../components/earthEngine/layers/precipitation_monthly_ERA5-Land.js'
import temperatureMonthly from '../components/earthEngine/layers/temperature_monthly_ERA5-Land.js'

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
