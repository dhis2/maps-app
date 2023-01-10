import { combineEpics } from 'redux-observable'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/concatMapTo'
import 'rxjs/add/observable/empty'
import dataDownloadEpics from './dataDownload.js'
import dataElementEpics from './dataElements.js'
import dimensionEpics from './dimensions.js'
import indicatorEpics from './indicators.js'
import layerEpics from './layers.js'
import legendSetEpics from './legendSets.js'
import optionSetEpics from './optionSets.js'
import orgUnitEpis from './orgUnits.js'
import programEpics from './programs.js'
import trackedEntitiesEpics from './trackedEntities.js'

const errorEpic = (action$) =>
    action$
        .filter((action) => action.type.includes('ERROR'))
        .do((action) => console.error(action.error))
        .concatMapTo(Observable.empty()) // Avoid infinite loop, same as .map(action => Observable.empty()).concatAll()

export default combineEpics(
    dataElementEpics,
    errorEpic,
    indicatorEpics,
    layerEpics,
    legendSetEpics,
    optionSetEpics,
    orgUnitEpis,
    programEpics,
    dimensionEpics,
    trackedEntitiesEpics,
    dataDownloadEpics
)
