import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concatMapTo';
import 'rxjs/add/observable/empty';
import orgUnitsEpis from './orgUnits';
import programsEpics from './programs';
import indicatorsEpics from './indicators';
import optionSetsEpics from './optionSets';
import externalLayersEpics from './externalLayers';
import dataElementsEpics from './dataElements';
import dataSetsEpics from './dataSets';
import legendSetsEpics from './legendSets';
import earthEngineEpics from './earthEngine';

const errorEpic = (action$) =>
    action$
        .filter((action) => action.type.indexOf('ERROR') !== -1)
        .do((action) => console.error(action.error))
        .concatMapTo(Observable.empty()); // Avoid infinite loop, same as .map(action => Observable.empty()).concatAll()

export default combineEpics(
    orgUnitsEpis,
    programsEpics,
    indicatorsEpics,
    optionSetsEpics,
    externalLayersEpics,
    dataElementsEpics,
    dataSetsEpics,
    legendSetsEpics,
    errorEpic,
    earthEngineEpics
);
