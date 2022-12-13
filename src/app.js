import { debounce } from 'lodash/fp'
import log from 'loglevel'
import React from 'react'
import { render } from 'react-dom'
import 'url-polyfill'
import { resizeScreen } from './actions/ui.js'
import Root from './components/Root.js'
import store from './store/index.js'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

render(<Root store={store} />, document.getElementById('dhis2-app-root'))

// Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
window.addEventListener(
    'resize',
    debounce(150, () =>
        store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))
    )
)
