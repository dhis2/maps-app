import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import reducers from '../reducers';
import rootEpic from '../epics';
import history from './history';
import { connectRoutes } from 'redux-first-router'
import queryString from 'query-string'

const epicMiddleware = createEpicMiddleware(rootEpic);

const routesMap = {FAVORITE_LOAD: "/"};
const routes = connectRoutes(history, routesMap, {querySerializer: queryString});
const middleware = applyMiddleware(routes.middleware, epicMiddleware);

const store = createStore(
    combineReducers({
      ...reducers,
      location: routes.reducer,
    }),
    process.env.NODE_ENV === 'development' &&
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__(),
    compose(routes.enhancer, middleware),
);

export default store;
