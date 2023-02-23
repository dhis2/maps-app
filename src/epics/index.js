import { combineEpics } from 'redux-observable'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/concatMapTo'
import 'rxjs/add/observable/empty'

const errorEpic = (action$) =>
    action$
        .filter((action) => action.type.includes('ERROR'))
        .do((action) => console.error(action.error))
        .concatMapTo(Observable.empty()) // Avoid infinite loop, same as .map(action => Observable.empty()).concatAll()

export default combineEpics(errorEpic)
