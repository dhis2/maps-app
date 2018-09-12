import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createEpicMiddleware } from 'redux-observable'; // TODO: Stop using
import reducer from '../reducers';
import rootEpic from '../epics'; // TODO: Stop using

const epicMiddleware = createEpicMiddleware(rootEpic);

const store = createStore(
    reducer,
    process.env.NODE_ENV === 'development' &&
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, epicMiddleware)
);

export default store;
