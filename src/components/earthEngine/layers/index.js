import buildings from './buildings_GOOGLE.js'
import elevation from './elevation_SRTM.js'
import landcover100m from './landcover_CGLS.js'
import landcover from './landcover_MCD12Q1.js'
import nighttimeLights from './legacy/nighttime_DMSP-OLS .js'
import precipitationLegacy from './legacy/precipitation_pentad_CHIRPS.js'
import temperatureLegacy from './legacy/temperature_MOD11A2v061.js'
import nitrogenDioxide from './nitrogen_dioxide_Sentinel-5P.js'
import ozone from './ozone_Sentinel-5P.js'
import particlePollution from './particle_pollution_CAMS.js'
import populationAgeSex from './population_age_sex_WorldPop.js'
import populationTotal from './population_total_WorldPop.js'
import precipitationDailyChirps from './precipitation_daily_CHIRPS.js'
import precipitationDaily from './precipitation_daily_ERA5-Land.js'
import precipitationMonthly from './precipitation_monthly_ERA5-Land.js'
import satelliteImagery from './satellite_imagery_Sentinel-2.js'
import sulfurDioxide from './sulfur_dioxide_Sentinel-5P.js'
import temperatureDaily from './temperature_daily_ERA5-Land.js'
import temperatureMax from './temperature_daily_max_ERA5-Land.js'
import temperatureMonthly from './temperature_monthly_ERA5-Land.js'

const earthEngineLayers = [
    buildings,
    elevation,
    landcover,
    landcover100m,
    nighttimeLights,
    nitrogenDioxide,
    ozone,
    particlePollution,
    populationTotal,
    populationAgeSex,
    precipitationDaily,
    precipitationDailyChirps,
    precipitationMonthly,
    precipitationLegacy,
    satelliteImagery,
    sulfurDioxide,
    temperatureDaily,
    temperatureMax,
    temperatureMonthly,
    temperatureLegacy,
]

export default earthEngineLayers
