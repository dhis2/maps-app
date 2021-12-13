import React from 'react';
import { render } from 'react-dom';
import 'url-polyfill';
import log from 'loglevel';
import { debounce } from 'lodash/fp';
import store from './store';
import Root from './components/Root';
import { resizeScreen } from './actions/ui';
import { getUrlParameter } from './util/requests';

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
);

const mapId = getUrlParameter('id');
const analyticalObject = getUrlParameter('currentAnalyticalObject');

render(
    <Root store={store} mapId={mapId} analyticalObject={analyticalObject} />,
    document.getElementById('dhis2-app-root')
);

// Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
window.addEventListener(
    'resize',
    debounce(150, () =>
        store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))
    )
);
