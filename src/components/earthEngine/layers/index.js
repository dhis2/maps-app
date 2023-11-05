import buildings from './buildings_GOOGLE.js'
import elevation from './elevation_SRTM.js'
import landcover from './landcover_MCD12Q1.js'
import landcover100m from './landcover_CGLS.js'
import nighttimeLights from './legacy/nighttime_DMSP-OLS .js'
import populationTotal from './population_total_WorldPop.js'
import populationAgeSex from './population_age_sex_WorldPop.js'
import precipitationDaily from './precipitation_daily_ERA5-Land.js'
import precipitationMonthly from './precipitation_monthly_ERA5-Land.js'
import precipitationLegacy from './legacy/precipitation_CHIRPS.js'
import temperatureDaily from './temperature_daily_ERA5-Land.js'
import temperatureMonthly from './temperature_monthly_ERA5-Land.js'
import temperatureLegacy from './legacy/temperature_MOD11A2v061.js'

const earthEngineLayers = [
    buildings,
    elevation,
    landcover,
    landcover100m,
    nighttimeLights,
    populationTotal,
    populationAgeSex,
    precipitationDaily,
    precipitationMonthly,
    precipitationLegacy,
    temperatureDaily,
    temperatureMonthly,
    temperatureLegacy,
]

export default earthEngineLayers
