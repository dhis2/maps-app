# Basemaps in the layer catalog - design

Date: 2026-08-28
Branch: `layer-catalog-prototype`
Status: approved, throwaway prototype

## Context

Basemaps and overlays are managed in two unrelated places today:

-   Overlays come from `getDefaultLayerSources()` (`src/util/app.js`), which
    explicitly **drops** every `externalMapLayers` entry with
    `mapLayerPosition === MAP_LAYER_POSITION_BASEMAP`. They are browsed in the
    Add layer catalog (`AddLayerPopover`) and enabled/disabled by an admin in
    `ManageLayerSourcesModal`.
-   Basemaps come from `getBasemapList()` (`src/util/basemaps.js`) - the 11
    entries in `defaultBasemaps()` plus external layers positioned as basemaps -
    and are picked from a thumbnail grid on the map's Basemap card. Nothing
    about them is configurable.

Basemaps share every characteristic of an overlay layer source: a name, a map
service, a URL, a provenance, and an admin decision about whether map authors
should see them at all. This design brings them into the same management view
rather than building a parallel one.

## Goals

-   List basemaps beside overlays in `ManageLayerSourcesModal`, filterable by a
    new **Placement** filter.
-   Make the admin's enable/disable decision visibly affect the map's Basemap
    card.
-   Make the Add source form's existing "Layer position: Basemap" option
    actually produce a basemap instead of a dead-end notice.
-   Speed over durability. This is a prototype and is expected to be deleted.

## Non-goals

-   Showing basemaps in the Add layer catalog popover (`AddLayerPopover`). It
    stays overlay-only, with no Placement tabs. Basemaps are chosen on the
    Basemap card.
-   Writing to the API, or persisting anything beyond the existing
    localStorage prototype stores.
-   Editing or deleting existing sources.
-   Reordering basemaps, or choosing the instance default basemap.
-   Pinning basemaps.

## Model: placement is orthogonal to kind

`kind` (`KIND_BUILT_IN` / `KIND_EARTH_ENGINE` / `KIND_EXTERNAL`) describes
provenance. Placement is independent of it: OSM Light is built-in + basemap, a
registered WMS basemap is external + basemap.

New in `src/util/layerSources.js`:

```js
export const PLACEMENT_OVERLAY = 'overlay'
export const PLACEMENT_BASEMAP = 'basemap'

// Entries are tagged with `placement` where they are composed; anything
// untagged is an overlay, which is what every existing caller assumes.
export const getLayerSourcePlacement = (entry) =>
    entry?.placement ?? PLACEMENT_OVERLAY

export const getLayerSourcePlacementLabel = (placement) => ...
```

Basemap entries are tagged at the point they enter the modal's source list
(`{ ...basemap, placement: PLACEMENT_BASEMAP }`), not inside
`defaultBasemaps()` or `getBasemapList()` - those stay untouched so the map
keeps working exactly as before.

### Two fixes this exposes

1. `getManagedLayerSourceId(entry)` is `entry.layerId ?? entry.config?.id ??
entry.layer`. A `defaultBasemaps()` entry has none of those - it carries a
   top-level `id` - so it currently resolves to `undefined`, which would collide
   across every built-in basemap in the deny-list. Add `entry.id` as the final
   fallback. External basemaps built by `createExternalBasemapLayer()` set both
   `id` and `config.id` to the same value, so nothing else shifts.
2. `getLayerSourceMeta()` only produces Service/Host chips for
   `KIND_EXTERNAL`. Broaden the condition so any entry with a `config.type`
   gets them, which gives built-in basemaps their chips too, and add
   `BING_LAYER` / `AZURE_LAYER` to `EXTERNAL_TYPE_LABELS` ("Bing" / "Azure").
   Bing and Azure entries have no `url`, so the Host chip is simply omitted.

## Admin modal changes

### Sources

The modal reads the already-assembled `basemaps` list from `useCachedData()` -
the same list the Basemap card renders. That list is `defaultBasemaps()`
filtered by API key validation, concatenated with the external basemaps, so it
is exactly the set an author can actually use. No new query, and nothing in
`src/util/app.js` or `src/util/basemaps.js` changes.

Each entry is tagged `placement: PLACEMENT_BASEMAP` and appended to the
existing groups. `getLayerSourceKind()` already sorts them correctly with no
change: external basemaps carry `layer: EXTERNAL_LAYER` and land in
`KIND_EXTERNAL`, while `defaultBasemaps()` entries carry no `layer` and fall
through to `KIND_BUILT_IN`.

-   `KIND_BUILT_IN` gains the built-in basemaps, listed after the built-in data
    layer types.
-   `KIND_EXTERNAL` gains the external basemaps, plus any basemap added this
    session, plus the new mock basemaps.

Because the built-in group now holds both, its label changes from "Built-in
data sources" to "Built-in" (`getLayerSourceKindLabel`). The Type filter keeps
its three provenance options; placement is a separate filter, not a fourth
type.

### Placement pill

`LayerSource` gains an optional `placement` prop. When it is
`PLACEMENT_BASEMAP`, a "Basemap" pill renders next to the name, reusing the
`newPill` treatment already in `LayerSource.module.css` (a new `.placementPill`
class sharing the same shape, in a neutral grey rather than teal so it reads as
a category rather than a status). Overlay rows get no pill - overlay is the
default and pilling everything is noise.

### Placement filter

A third `SingleSelect` in the existing toolbar, after Status and Type:

| Placement |
| --------- |
| All       |
| Overlay   |
| Basemap   |

It filters exactly like the others - `getLayerSourcePlacement(source)` compared
against the selected value - and is reset along with the rest when a source is
added. Earth Engine sources are always overlays, so selecting Basemap empties
that group and it drops out via the existing `.filter(group => group.sources.length)`.

### Last basemap guard

If an admin disables every basemap the map has nothing to render. When exactly
one basemap is currently enabled, that row's checkbox is disabled and the row
carries `title="At least one basemap must stay enabled"`, and clicking it does
nothing. Overlays have no such guard.

### Footer count

"N of M sources enabled" now counts basemaps too. No code change - it already
derives from `groups`.

## Add source form

The form itself is unchanged: it already has a Layer position select with
Overlay/Basemap, and `getExternalLayerModel()` already returns
`mapLayerPosition`.

`onAddSource()` in `ManageLayerSourcesModal` branches instead:

-   Overlay: `createExternalOverlayLayer(model)`, as today.
-   Basemap: `createExternalBasemapLayer(model)`, tagged
    `placement: PLACEMENT_BASEMAP`.

Both are stored with `isNew: true` and appear as a row in the list. The current
behaviour - a basemap adds no row and shows an "it is not listed here" notice -
is removed. The success notice for a basemap reads:

> "{{name}}" was added as a basemap and is available on the Basemap card.

## Author side: Basemap card

`BasemapList` currently renders `useCachedData().basemaps` verbatim. It now:

1. Appends basemaps added this session (from the shared store below).
2. Filters out anything the admin disabled, via
   `useLayerCatalogPrefs().isDisabled(getManagedLayerSourceId(basemap))`.
3. Renders the thumbnail grid unchanged, then a borderless "More basemaps…"
   button below it. Clicking it toggles open a `SingleSelect` listing every
   enabled basemap by name; choosing one calls the same `selectBasemap` the
   tiles call. The grid is **not** capped - the select is purely an additional
   way in, useful once an instance has external basemaps whose tiles are all
   the same "External basemap" placeholder.

If the currently selected basemap is disabled while it is in use, nothing
special happens - it stays on the map for this session. `getBasemapOrFallback()`
already handles a missing basemap on the next load.

## Plumbing: two prototype stores go module-level

Both existing prototype stores are per-component-instance `useState`, which was
fine while only the popover and the modal used them - they unmount and remount.
It breaks now:

-   `addedSources` lives in `AddLayerButton`'s local state. `BasemapCard` is a
    sibling, so an added basemap cannot reach it.
-   `useLayerCatalogPrefs` re-reads localStorage per instance. `BasemapList`
    stays mounted while the modal is open, so toggling a basemap there would
    not update the grid.

Both become module-level stores read through `useSyncExternalStore`, sharing one
tiny helper:

```
src/hooks/prototypeStore.js      // createStore({ key, initial }) -> { get, set, subscribe }
src/hooks/useAddedLayerSources.js // { addedSources, addSource } - localStorage-backed
src/hooks/useLayerCatalogPrefs.js // same API as now, backed by the shared store
```

`useLayerCatalogPrefs` keeps its current public API (`isPinned`, `isDisabled`,
`togglePinned`, `toggleDisabled`, `pinnedIds`, `disabledIds`) so its callers do
not change.

`AddLayerButton` drops its `addedSources` state and its `addedSources` /
`onSourceAdded` props to the popover and modal; those components read the hook
directly. `AddLayerPopover` filters the added sources to overlays only, so an
added basemap never appears in the Add layer catalog.

## Mock data

`mockLayerSources.js` gains a `mockBasemapSources()` export - three external
basemap entries shaped by `createExternalBasemapLayer` and tagged
`placement: PLACEMENT_BASEMAP` - so the Placement filter has something to show
beyond the built-ins. Suggested set: a national orthophoto WMS, a dark
cartographic XYZ style, and a vector style basemap.

## Files

New:

-   `src/hooks/prototypeStore.js`
-   `src/hooks/useAddedLayerSources.js`

Changed:

-   `src/util/layerSources.js` - placement constants and helpers, `entry.id`
    fallback in `getManagedLayerSourceId`, meta chips for any entry with a
    `config.type`, Bing/Azure type labels, "Built-in" group label.
-   `src/hooks/useLayerCatalogPrefs.js` - backed by the shared module store.
-   `src/components/layerSources/ManageLayerSourcesModal.jsx` - basemap sources,
    Placement filter, placement pill wiring, last-basemap guard, basemap add
    path, reads the added-sources hook.
-   `src/components/layerSources/LayerSource.jsx` - optional `placement` prop.
-   `src/components/layerSources/styles/LayerSource.module.css` - `.placementPill`.
-   `src/components/layerSources/styles/ManageLayerSourcesModal.module.css` -
    room for a third select in the toolbar.
-   `src/components/layers/basemaps/BasemapList.jsx` - added basemaps, disabled
    filtering, "More basemaps…" select.
-   `src/components/layers/basemaps/styles/BasemapList.module.css` - link and
    select styles.
-   `src/components/layers/overlays/AddLayerButton.jsx` - drops `addedSources`
    state and props.
-   `src/components/layers/overlays/AddLayerPopover.jsx` - reads added overlays
    from the hook.
-   `src/constants/mockLayerSources.js` - `mockBasemapSources()`.

All new code carries a `PROTOTYPE ONLY` comment, matching the existing
prototype files.

## Testing

No automated tests, consistent with the rest of this prototype. Verification is
`yarn lint` clean plus a manual pass:

1. Open Configure available layer sources - built-in basemaps appear under
   Built-in with a Basemap pill, external basemaps under External.
2. Placement: Basemap shows only basemaps; Placement: Overlay hides them;
   combining with Status and Type narrows as expected.
3. Disable a basemap - it disappears from the Basemap card grid and the
   "More basemaps…" select immediately, with the modal still open.
4. Disable all but one - the last one's checkbox is disabled.
5. Add a source with Layer position: Basemap - a row appears with Basemap and
   "Added in this session" pills, and the basemap appears on the Basemap card
   and is selectable.
6. Add a source with Layer position: Overlay - unchanged from today, and it does
   not appear on the Basemap card.
7. The Add layer catalog popover shows no basemaps and has no Placement control.
