import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createEpicMiddleware } from 'redux-observable'; // TODO: Stop using
import reducer from '../reducers';
import rootEpic from '../epics'; // TODO: Stop using

const epicMiddleware = createEpicMiddleware(rootEpic);

const composeEnhancer =
    (process.env.NODE_ENV === 'development' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

const store = createStore(
    reducer,
    composeEnhancer(applyMiddleware(thunk, epicMiddleware))
);

export default store;
