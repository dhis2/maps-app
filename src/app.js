import log from 'loglevel'
import React from 'react'
import { render } from 'react-dom'
import 'url-polyfill'
import Root from './components/Root.js'
import store from './store/index.js'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

render(<Root store={store} />, document.getElementById('dhis2-app-root'))
