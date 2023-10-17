import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from '../reducers/index.js'

const composeEnhancer =
    (process.env.NODE_ENV === 'development' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose

const store = createStore(reducer, composeEnhancer(applyMiddleware(thunk)))

if (window.Cypress) {
    window.store = store
}

export default store
