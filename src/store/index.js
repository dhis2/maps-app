import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createEpicMiddleware } from 'redux-observable';
import reducer from '../reducers';
import rootEpic from '../epics';

const epicMiddleware = createEpicMiddleware(rootEpic);

/*
const storeFactory = () => createStore(
    reducer,
    process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, epicMiddleware)
);

export default storeFactory;
*/

const store = createStore(
  reducer,
  process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunk, epicMiddleware)
);

export default store;
