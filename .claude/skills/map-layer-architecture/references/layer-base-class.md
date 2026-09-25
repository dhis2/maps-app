# The `Layer` base class

`src/components/map/layers/Layer.js` is an abstract React **class** component every concrete layer type extends (`ThematicLayer`, `EventLayer`, `OrgUnitLayer`, `TrackedEntityLayer`, `FacilityLayer`, `ExternalLayer`, `GeoJsonLayer`, `BasemapLayer`). It bridges React lifecycle to maps-gl's **imperative** API — don't manage layer state with plain React state, funnel changes through this base class's methods.

-   `componentDidMount` → `createLayer()` → `map.createLayer(config)` + `map.addLayer(this.layer)`.
-   `componentDidUpdate(prevProps)` diffs props and picks the cheapest applicable update:
    -   Data/config actually changed → `updateLayer()` (destroys and recreates the underlying maps-gl layer — expensive).
    -   Only order changed → `setLayerOrder()`.
    -   Only opacity changed → `setLayerOpacity()`.
    -   Only visibility changed → `setLayerVisibility()`.
    -   A feature needs highlighting → `highlightFeature(feature)`.
-   `componentWillUnmount` removes the layer from the map.

**When adding a new layer type**: extend `Layer`, override what you need (data fetching, config shape), but reuse the base class's update-diffing rather than re-implementing it. **When modifying update behavior**: change it in the base class, not per-subclass, unless the behavior is genuinely subclass-specific.

**Performance rule**: never trigger a full `updateLayer()` when a cheaper method covers the actual change — destroy+recreate on every prop change is the most common map-perf regression in this codebase.
