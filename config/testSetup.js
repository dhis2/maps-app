import { configure } from '@testing-library/dom'
import '@testing-library/jest-dom'
import React from 'react'
import 'jest-webgl-canvas-mock'

// Emulate CSS.supports API
// Needed with Highcharts >= 12.2.0
// See: https://github.com/highcharts/highcharts/issues/22910
global.CSS.supports = () => true

// https://stackoverflow.com/questions/58070996/how-to-fix-the-warning-uselayouteffect-does-nothing-on-the-server
React.useLayoutEffect = React.useEffect

// https://stackoverflow.com/questions/57943736/how-to-fix-window-url-createobjecturl-is-not-a-function-when-testing-mapbox-gl
if (typeof window.URL.createObjectURL === 'undefined') {
    window.URL.createObjectURL = () => {}
}

configure({ testIdAttribute: 'data-test' })
