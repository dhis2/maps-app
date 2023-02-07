import { combineEpics } from 'redux-observable'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/concatMapTo'
import 'rxjs/add/observable/empty'
import dataDownloadEpics from './dataDownload.js'
import orgUnitEpis from './orgUnits.js'

const errorEpic = (action$) =>
    action$
        .filter((action) => action.type.includes('ERROR'))
        .do((action) => console.error(action.error))
        .concatMapTo(Observable.empty()) // Avoid infinite loop, same as .map(action => Observable.empty()).concatAll()

export default combineEpics(
    errorEpic,
    orgUnitEpis,
    dataDownloadEpics
)
