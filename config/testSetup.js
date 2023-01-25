import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import React from 'react'

// https://stackoverflow.com/questions/58070996/how-to-fix-the-warning-uselayouteffect-does-nothing-on-the-server
React.useLayoutEffect = React.useEffect

// https://stackoverflow.com/questions/57943736/how-to-fix-window-url-createobjecturl-is-not-a-function-when-testing-mapbox-gl
if (typeof window.URL.createObjectURL === 'undefined') {
    window.URL.createObjectURL = () => {}
}

configure({ adapter: new Adapter() })
