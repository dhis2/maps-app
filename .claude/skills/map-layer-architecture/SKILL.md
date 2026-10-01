---
name: map-layer-architecture
description: Use when adding or modifying a map layer type, thematic/classification config, Earth Engine layers, or anything at the maps-app/@dhis2/maps-gl rendering boundary.
---

# Map layer architecture

| Working on...                                                                                  | Read                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------- |
| A layer type (thematic, event, org unit, tracked entity, facility, external, GeoJSON, basemap) | `references/layer-base-class.md` |
| Legend/classification config (color scales, legend sets, decimal places)                       | `references/classification.md`   |
| An Earth Engine dataset layer, or a build/dev-server issue involving `@dhis2/maps-gl`          | `references/earth-engine.md`     |
| Behavior that differs between the standalone app and the dashboard-embedded plugin             | See "Dual deployment" below      |

## The maps-app / maps-gl boundary

maps-app owns data fetching, Redux state, and config UI. `@dhis2/maps-gl` (imported via `src/components/map/MapApi.js`) owns the actual MapLibre GL rendering, layer/control types, and the Earth Engine worker. Changing what a "layer" can do usually touches both repos — check `@dhis2/maps-gl`'s `layerTypes.js`/`controlTypes.js` registries when a new layer _kind_ is needed, not just new _config_ for an existing kind.

## Dual deployment

`d2.config.js` declares two entry points: `app` (`AppWrapper.jsx`, standalone) and `plugin` (`PluginWrapper.jsx`, `pluginType: 'DASHBOARD'`, embedded in a dashboard). `PluginWrapper.jsx` debounces window-resize-driven re-renders specifically for the embedded case — if you're touching resize/layout logic, check both entry points render correctly.

**The plugin entry point does not have a Redux store.** `AppWrapper.jsx` wraps its tree in `<ReduxProvider store={store}>`; `PluginWrapper.jsx` renders `<Plugin>` directly with no `Provider` at all. Any component that needs to render inside the dashboard plugin (not just the standalone app) can't rely on `connect`/`useSelector`/`useDispatch` reaching a real store — `connect`'d components mounted under the plugin tree would break or silently get `undefined` state. Check whether a component you're changing is reachable from `Plugin.jsx` before assuming Redux is available.
