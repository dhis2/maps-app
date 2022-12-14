import {
    mapControls,
    splitViewControls,
    pluginControls,
} from '../constants/mapControls.js'

// Returns the map controls shown on a map
export const getMapControls = (isPlugin, isSplitView, controls) => {
    let ctrls

    if (isPlugin) {
        ctrls = controls || pluginControls
    } else {
        ctrls = controls || isSplitView ? splitViewControls : mapControls
    }

    return isSplitView
        ? ctrls.map((c) => ({
              ...c,
              isSplitView,
          }))
        : ctrls
}
