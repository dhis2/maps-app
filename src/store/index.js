import { createStore, compose, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable'; // TODO: Stop using
import thunk from 'redux-thunk';
import rootEpic from '../epics/index.js'; // TODO: Stop using
import reducer from '../reducers/index.js';

const epicMiddleware = createEpicMiddleware(rootEpic);

const composeEnhancer =
    (process.env.NODE_ENV === 'development' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

const store = createStore(
    reducer,
    composeEnhancer(applyMiddleware(thunk, epicMiddleware))
);

if (window.Cypress) {
    window.store = store;
}

export default store;
