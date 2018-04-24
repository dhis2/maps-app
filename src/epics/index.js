import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concatMapTo';
import 'rxjs/add/observable/empty';
import dataElementEpics from './dataElements';
import dataSetEpics from './dataSets';
import earthEngineEpics from './earthEngine';
import externalLayerEpics from './externalLayers';
import favoriteEpics from './maps';
import indicatorEpics from './indicators';
import layerEpics from './layers';
import legendSetEpics from './legendSets';
import optionSetEpics from './optionSets';
import orgUnitEpis from './orgUnits';
import programEpics from './programs';
import favoritesEpics from './favorites';
import interpretationsEpics from './interpretations';

const errorEpic = action$ =>
    action$
        .filter(action => action.type.indexOf('ERROR') !== -1)
        .do(action => console.error(action.error))
        .concatMapTo(Observable.empty()); // Avoid infinite loop, same as .map(action => Observable.empty()).concatAll()

export default combineEpics(
    dataElementEpics,
    dataSetEpics,
    earthEngineEpics,
    errorEpic,
    externalLayerEpics,
    favoriteEpics,
    indicatorEpics,
    layerEpics,
    legendSetEpics,
    optionSetEpics,
    orgUnitEpis,
    programEpics,
    favoritesEpics,
    interpretationsEpics,
);
