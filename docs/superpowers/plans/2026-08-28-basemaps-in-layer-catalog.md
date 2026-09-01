# Basemaps in the Layer Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** List basemaps alongside overlays in the admin "Configure available layer sources" modal, filterable by a new Placement filter, with the admin's enable/disable decision visibly driving the map's Basemap card.

**Architecture:** Placement (`overlay` / `basemap`) is a new attribute orthogonal to the existing `kind` (provenance). The modal tags entries from `useCachedData().basemaps` as basemaps and merges them into the existing kind groups, so `getLayerSourceKind()` sorts them with no change. Two prototype stores (`addedSources`, layer catalog prefs) move from per-component `useState` to module-level stores read via `useSyncExternalStore`, so the Basemap card and the modal - siblings that are mounted at the same time - stay in sync.

**Tech Stack:** React 18, `@dhis2/ui`, CSS modules, `@dhis2/d2-i18n`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-28-basemaps-in-layer-catalog-design.md`

**Testing note:** This is a throwaway prototype. The repo has no tests for any of the
surrounding prototype components, and the spec explicitly rules out adding any. So there is
no TDD loop here - each task verifies with `yarn lint` plus a named manual check in the
running app (`yarn start`, DHIS2 dev instance, Maps app, the layers panel on the left).
Do not add Jest or Cypress tests for this work.

**Commit convention:** commits in this branch are signed off with
`git -c commit.gpgsign=false commit` because signing is not configured in this environment.

---

### Task 1: Placement helpers and two id/meta fixes

Adds the placement vocabulary everything else depends on, and fixes two existing bugs in
`src/util/layerSources.js` that basemaps expose.

**Files:**

-   Modify: `src/util/layerSources.js`

-   [ ] **Step 1: Add `BING_LAYER` and `AZURE_LAYER` to the layer constant imports**

In `src/util/layerSources.js`, the import block at the top pulls layer type constants from
`../constants/layers.js`. Add the two basemap-only types to it:

```js
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    EXTERNAL_LAYER,
    GEOJSON_URL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    GEOJSON_LAYER,
    VECTOR_STYLE,
    BING_LAYER,
    AZURE_LAYER,
} from '../constants/layers.js'
```

-   [ ] **Step 2: Add the placement constants and helpers**

Add this block immediately after the existing `getLayerSourceKindLabel` definition (just
before the `DEFAULT_PINNED_IDS` export):

```js
// PROTOTYPE ONLY - placement is orthogonal to kind: OSM Light is built-in +
// basemap, a registered WMS basemap is external + basemap. Entries are tagged
// with `placement` where the catalog composes them; anything untagged is an
// overlay, which is what every pre-existing caller assumes.
export const PLACEMENT_OVERLAY = 'overlay'
export const PLACEMENT_BASEMAP = 'basemap'

export const getLayerSourcePlacement = (entry) =>
    entry?.placement ?? PLACEMENT_OVERLAY

export const getLayerSourcePlacementLabel = (placement) =>
    ({
        [PLACEMENT_OVERLAY]: i18n.t('Overlay'),
        [PLACEMENT_BASEMAP]: i18n.t('Basemap'),
    }[placement] || placement)
```

-   [ ] **Step 3: Rename the built-in kind label**

The built-in group now holds both data layer types and basemaps, so "Built-in data sources"
is wrong. In `getLayerSourceKindLabel`, change the `KIND_BUILT_IN` entry only:

```js
export const getLayerSourceKindLabel = (kind) =>
    ({
        [KIND_BUILT_IN]: i18n.t('Built-in'),
        [KIND_EARTH_ENGINE]: i18n.t('Earth Engine'),
        [KIND_EXTERNAL]: i18n.t('External data'),
    }[kind] || kind)
```

-   [ ] **Step 4: Fix `getManagedLayerSourceId` for built-in basemaps**

A `defaultBasemaps()` entry has no `layerId`, no `config.id` and no `layer` - it carries a
top-level `id` (`'osmLight'`, `'bingAerial'`). Today this function returns `undefined` for
all of them, which would collide in the disabled list. Add `entry.id` as the final fallback.
External basemaps set both `id` and `config.id` to the same value, so nothing else shifts.

Replace the existing definition:

```js
// Id used by the manage dialog, where Earth Engine layers are listed
// individually rather than collapsed into their group. Deliberately skips the
// grouping branch of resolveGroupKey so sibling layers stay distinct.
// Built-in basemaps carry none of the first three and fall back to `id`.
export const getManagedLayerSourceId = (entry) =>
    entry?.layerId ?? entry?.config?.id ?? entry?.layer ?? entry?.id
```

-   [ ] **Step 5: Give built-in basemaps their Service/Host meta chips**

Two changes in the same area of the file.

First, extend `EXTERNAL_TYPE_LABELS` with the two basemap-only types:

```js
const EXTERNAL_TYPE_LABELS = {
    [TILE_LAYER]: i18n.t('XYZ tiles'),
    [WMS_LAYER]: i18n.t('WMS'),
    [GEOJSON_LAYER]: i18n.t('GeoJSON'),
    [VECTOR_STYLE]: i18n.t('Vector style'),
    [BING_LAYER]: i18n.t('Bing'),
    [AZURE_LAYER]: i18n.t('Azure'),
}
```

Second, in `getLayerSourceMeta`, the external branch is currently gated on
`kind === KIND_EXTERNAL`, so built-in basemaps get no chips at all. Broaden it to any entry
that carries a `config.type`. Replace:

```js
    if (kind === KIND_EXTERNAL) {
```

with:

```js
    // Any entry with a renderable config gets Service/Host chips - that covers
    // external layers and built-in basemaps alike
    if (entry?.config?.type) {
```

Leave the body of that branch, and the trailing `return []`, exactly as they are. Bing and
Azure entries have no `url`, so `getUrlHost('')` returns `''` and the Host chip is dropped
by the existing `.filter(Boolean)`.

-   [ ] **Step 6: Verify lint passes**

Run: `yarn lint`
Expected: no errors. (Pre-existing warnings elsewhere in the repo are fine; there must be
no new error in `src/util/layerSources.js`.)

-   [ ] **Step 7: Verify nothing regressed in the app**

Run: `yarn start`, open the Maps app, click **Add layer**.
Expected: the catalog popover looks exactly as before, and the group heading in **Configure
available layer sources** now reads "Built-in" instead of "Built-in data sources".

-   [ ] **Step 8: Commit**

```bash
git add src/util/layerSources.js
git -c commit.gpgsign=false commit -m "feat: add layer source placement helpers (prototype)"
```

---

### Task 2: Module-level prototype stores

`addedSources` lives in `AddLayerButton` local state and `useLayerCatalogPrefs` re-reads
localStorage per component instance. `BasemapCard` is a sibling of `AddLayerButton` and stays
mounted while the modal is open, so neither piece of state can reach it. Both become
module-level stores read through `useSyncExternalStore`.

**Files:**

-   Create: `src/hooks/prototypeStore.js`
-   Create: `src/hooks/useAddedLayerSources.js`
-   Modify: `src/hooks/useLayerCatalogPrefs.js`
-   Modify: `src/components/layers/overlays/AddLayerButton.jsx`
-   Modify: `src/components/layers/overlays/AddLayerPopover.jsx`
-   Modify: `src/components/layerSources/ManageLayerSourcesModal.jsx`

-   [ ] **Step 1: Create the shared store helper**

Create `src/hooks/prototypeStore.js`:

```js
// PROTOTYPE ONLY - a minimal localStorage-backed store with subscribers, so
// sibling components (the Add layer button and the Basemap card) see each
// other's changes without a remount. The real thing belongs in the dataStore,
// next to the Earth Engine allow-list managed by useManagedLayerSourcesStore.
export const createPrototypeStore = ({ key, initial }) => {
    const read = () => {
        try {
            const stored = JSON.parse(window.localStorage.getItem(key))
            return stored === null ? initial : { ...initial, ...stored }
        } catch (error) {
            return initial
        }
    }

    let state = read()
    const listeners = new Set()

    const get = () => state

    const set = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater
        try {
            window.localStorage.setItem(key, JSON.stringify(state))
        } catch (error) {
            // ignore - prototype only
        }
        listeners.forEach((listener) => listener())
    }

    const subscribe = (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    return { get, set, subscribe }
}
```

-   [ ] **Step 2: Create the added-sources store hook**

Create `src/hooks/useAddedLayerSources.js`:

```js
import { useCallback, useSyncExternalStore } from 'react'
import { createPrototypeStore } from './prototypeStore.js'

// PROTOTYPE ONLY - sources registered through the manage dialog. The real
// thing would POST to externalMapLayers and come back through useCachedData.
const store = createPrototypeStore({
    key: 'maps-prototype-added-layer-sources',
    initial: { sources: [] },
})

const useAddedLayerSources = () => {
    const state = useSyncExternalStore(store.subscribe, store.get)

    const addSource = useCallback(
        (source) =>
            store.set((prev) => ({
                ...prev,
                sources: [...prev.sources, source],
            })),
        []
    )

    return { addedSources: state.sources, addSource }
}

export default useAddedLayerSources
```

-   [ ] **Step 3: Back `useLayerCatalogPrefs` with the shared store**

Replace the whole body of `src/hooks/useLayerCatalogPrefs.js` with the version below. The
public API (`pinnedIds`, `disabledIds`, `isPinned`, `isDisabled`, `togglePinned`,
`toggleDisabled`) is unchanged, so no caller needs editing.

```js
import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_PINNED_IDS } from '../util/layerSources.js'
import { createPrototypeStore } from './prototypeStore.js'

// PROTOTYPE ONLY - pinned layer sources, and the enabled/disabled state for
// built-in and external sources, kept in localStorage so it survives a reload
// while testing. The real thing belongs in the dataStore, next to the Earth
// Engine allow-list managed by useManagedLayerSourcesStore.
const store = createPrototypeStore({
    key: 'maps-prototype-layer-catalog',
    initial: { pinned: DEFAULT_PINNED_IDS, disabled: [] },
})

const toggle = (field, id) =>
    store.set((prev) => ({
        ...prev,
        [field]: prev[field].includes(id)
            ? prev[field].filter((item) => item !== id)
            : [...prev[field], id],
    }))

const useLayerCatalogPrefs = () => {
    const state = useSyncExternalStore(store.subscribe, store.get)

    const togglePinned = useCallback((id) => toggle('pinned', id), [])
    const toggleDisabled = useCallback((id) => toggle('disabled', id), [])

    return {
        pinnedIds: state.pinned,
        disabledIds: state.disabled,
        isPinned: useCallback(
            (id) => state.pinned.includes(id),
            [state.pinned]
        ),
        isDisabled: useCallback(
            (id) => state.disabled.includes(id),
            [state.disabled]
        ),
        togglePinned,
        toggleDisabled,
    }
}

export default useLayerCatalogPrefs
```

-   [ ] **Step 4: Drop the added-sources state and props from `AddLayerButton`**

Replace the whole of `src/components/layers/overlays/AddLayerButton.jsx` with:

```jsx
import i18n from '@dhis2/d2-i18n'
import { IconAddCircle24 } from '@dhis2/ui'
import React, { useState, useRef } from 'react'
import ManageLayerSourcesModal from '../../layerSources/ManageLayerSourcesModal.jsx'
import AddLayerPopover from './AddLayerPopover.jsx'
import styles from './styles/AddLayerButton.module.css'

const AddLayerButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isManaging, setIsManaging] = useState(false)
    const buttonRef = useRef()

    const toggleDialog = () => setIsOpen(!isOpen)

    const onManaging = () => {
        setIsManaging(true)
        setIsOpen(false)
    }

    return (
        <>
            <div className={styles.container} ref={buttonRef}>
                <button
                    className={styles.button}
                    onClick={toggleDialog}
                    data-test="add-layer-button"
                >
                    <span className={styles.content}>
                        <IconAddCircle24 />
                        <span>{i18n.t('Add layer')}</span>
                    </span>
                </button>
            </div>
            {isOpen && (
                <AddLayerPopover
                    anchorEl={buttonRef}
                    onClose={toggleDialog}
                    onManaging={onManaging}
                />
            )}
            {isManaging && (
                <ManageLayerSourcesModal onClose={() => setIsManaging(false)} />
            )}
        </>
    )
}

export default AddLayerButton
```

-   [ ] **Step 5: Read added overlays from the hook in `AddLayerPopover`**

In `src/components/layers/overlays/AddLayerPopover.jsx`:

Add the imports (keeping the existing import order - hooks after constants):

```js
import useAddedLayerSources from '../../../hooks/useAddedLayerSources.js'
```

and extend the existing `../../../util/layerSources.js` import with the placement helpers:

```js
import {
    groupLayerSources,
    getLayerSourceId,
    getLayerSourcePlacement,
    matchesLayerSourceFilter,
    PLACEMENT_OVERLAY,
} from '../../../util/layerSources.js'
```

Change the component signature from:

```js
const AddLayerPopover = ({ anchorEl, addedSources, onClose, onManaging }) => {
```

to:

```js
const AddLayerPopover = ({ anchorEl, onClose, onManaging }) => {
```

Add the hook call next to the other hooks, after `const { isPinned, isDisabled, togglePinned } = useLayerCatalogPrefs()`:

```js
const { addedSources } = useAddedLayerSources()
```

Change the `layerSources` composition so added basemaps never reach the Add layer catalog:

```js
// Basemaps are chosen on the Basemap card, never added as a layer here
const addedOverlays = addedSources.filter(
    (source) => getLayerSourcePlacement(source) === PLACEMENT_OVERLAY
)
const layerSources = includeEarthEngineLayers(
    defaultLayerSources,
    managedLayerSources
).concat(addedOverlays)
```

Finally remove `addedSources: PropTypes.array,` from `AddLayerPopover.propTypes`.

-   [ ] **Step 6: Read the hook in `ManageLayerSourcesModal`**

In `src/components/layerSources/ManageLayerSourcesModal.jsx`:

Add the import:

```js
import useAddedLayerSources from '../../hooks/useAddedLayerSources.js'
```

Change the signature from:

```js
const ManageLayerSourcesModal = ({ addedSources, onSourceAdded, onClose }) => {
```

to:

```js
const ManageLayerSourcesModal = ({ onClose }) => {
```

Add the hook next to the other hook calls at the top of the component:

```js
const { addedSources, addSource } = useAddedLayerSources()
```

Replace the single call to `onSourceAdded(...)` inside `onAddSource` with `addSource(...)`
(the argument is unchanged for now - Task 5 rewrites this function).

Replace the propTypes block at the bottom with:

```js
ManageLayerSourcesModal.propTypes = {
    onClose: PropTypes.func.isRequired,
}
```

-   [ ] **Step 7: Verify lint passes**

Run: `yarn lint`
Expected: no errors in any of the five touched files.

-   [ ] **Step 8: Verify the add flow still works end to end**

Run: `yarn start`, open Maps, **Add layer** → **Configure available layer sources** →
**Add source**. Register an XYZ source with Layer position **Overlay**.
Expected: the new row appears with the "Added in this session" pill, exactly as before this
task. Close the modal, reopen it - the row is still there (it now survives a page reload
too, because it is in localStorage).

-   [ ] **Step 9: Commit**

```bash
git add src/hooks/prototypeStore.js src/hooks/useAddedLayerSources.js src/hooks/useLayerCatalogPrefs.js src/components/layers/overlays/AddLayerButton.jsx src/components/layers/overlays/AddLayerPopover.jsx src/components/layerSources/ManageLayerSourcesModal.jsx
git -c commit.gpgsign=false commit -m "refactor: share prototype catalog state across components"
```

---

### Task 3: Mock basemap sources

So the Placement filter has external basemaps to show on a dev instance that has none
configured.

**Files:**

-   Modify: `src/constants/mockLayerSources.js`

-   [ ] **Step 1: Add the `mockBasemapSources` export**

In `src/constants/mockLayerSources.js`, extend the imports:

```js
import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
} from './layers.js'
import { PLACEMENT_BASEMAP } from '../util/layerSources.js'
```

(Keep the import order the linter expects: `@dhis2/d2-i18n` first, then `../util/...`, then
`./layers.js`. Run `yarn format` if the order is flagged.)

Then append this to the end of the file, after the existing `mockLayerSources` export:

```js
// Shaped like createExternalBasemapLayer() output, plus the placement tag the
// catalog filters on. No `img`, so they render the "External basemap"
// placeholder tile on the Basemap card, like real external basemaps do.
const mockBasemap = ({ id, name, description, type = TILE_LAYER, url }) => ({
    layer: EXTERNAL_LAYER,
    id,
    name,
    description,
    placement: PLACEMENT_BASEMAP,
    config: {
        id,
        type,
        name,
        url,
        tms: false,
        format: 'image/png',
    },
})

export const mockBasemapSources = () => [
    mockBasemap({
        id: 'mockOrthophoto22',
        name: i18n.t('National orthophoto 2022'),
        description: i18n.t(
            'Aerial imagery flown at 25cm resolution by the national mapping agency.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mockBasemap({
        id: 'mockDarkMatter',
        name: i18n.t('Dark cartographic base'),
        description: i18n.t(
            'Low contrast dark basemap, intended as a backdrop for bright thematic layers.'
        ),
        url: 'https://example.org/tiles/dark/{z}/{x}/{y}.png',
    }),
    mockBasemap({
        id: 'mockVectorStreets',
        name: i18n.t('Vector streets'),
        description: i18n.t(
            'Vector tile street map with labels in the national languages.'
        ),
        type: VECTOR_STYLE,
        url: 'https://example.org/styles/streets.json',
    }),
]
```

-   [ ] **Step 2: Verify lint passes**

Run: `yarn lint`
Expected: no errors. Nothing imports `mockBasemapSources` yet, so the app is unchanged.

-   [ ] **Step 3: Commit**

```bash
git add src/constants/mockLayerSources.js
git -c commit.gpgsign=false commit -m "feat: add mock basemap sources (prototype)"
```

---

### Task 4: Basemaps in the manage modal

The core of the feature: basemaps in the list, the Placement filter, the Basemap pill and
the last-basemap guard.

**Files:**

-   Modify: `src/components/layerSources/LayerSource.jsx`
-   Modify: `src/components/layerSources/styles/LayerSource.module.css`
-   Modify: `src/components/layerSources/ManageLayerSourcesModal.jsx`

-   [ ] **Step 1: Add the placement pill to `LayerSource`**

In `src/components/layerSources/LayerSource.jsx`, extend the util import:

```js
import {
    getLayerSourceLabel,
    getLayerSourceDescription,
    getLayerSourceMeta,
    getLayerSourcePlacementLabel,
    PLACEMENT_BASEMAP,
} from '../../util/layerSources.js'
```

Change the signature to accept the new props:

```jsx
const LayerSource = ({
    layerSource,
    isAdded,
    onToggle,
    isNew,
    placement,
    isLocked,
    lockedReason,
}) => {
```

Replace the outer `<div>` and the `Checkbox` with the locked-aware versions:

```jsx
    return (
        <div
            className={styles.layerSource}
            onClick={isLocked ? undefined : onToggle}
            title={isLocked ? lockedReason : undefined}
        >
            <Checkbox
                className={styles.checkbox}
                dataTest="layersource-checkbox"
                checked={isAdded}
                disabled={isLocked}
                dense
                onChange={() => {}}
            />
```

Add the pill next to the existing `isNew` pill inside `<div className={styles.name}>`, before
it, so category reads before status:

```jsx
<div className={styles.name}>
    {label}
    {placement === PLACEMENT_BASEMAP && (
        <span className={styles.placementPill}>
            {getLayerSourcePlacementLabel(placement)}
        </span>
    )}
    {isNew && (
        <span className={styles.newPill}>
            {i18n.t('Added in this session')}
        </span>
    )}
</div>
```

Extend the propTypes:

```js
LayerSource.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layerSource: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    isLocked: PropTypes.bool,
    isNew: PropTypes.bool,
    lockedReason: PropTypes.string,
    placement: PropTypes.string,
}
```

-   [ ] **Step 2: Add the pill style**

Append to `src/components/layerSources/styles/LayerSource.module.css`:

```css
.placementPill {
    display: inline-block;
    margin-inline-start: var(--spacers-dp8);
    padding: 1px 6px;
    border-radius: 8px;
    background-color: var(--colors-grey200);
    color: var(--colors-grey800);
    font-size: 11px;
    font-weight: 400;
    vertical-align: middle;
}
```

-   [ ] **Step 3: Pull basemaps into the modal's source list**

In `src/components/layerSources/ManageLayerSourcesModal.jsx`, extend the two relevant imports:

```js
import {
    mockLayerSources,
    mockBasemapSources,
} from '../../constants/mockLayerSources.js'
```

```js
import {
    getLayerSourceKind,
    getLayerSourceKindLabel,
    getLayerSourcePlacement,
    getLayerSourcePlacementLabel,
    getManagedLayerSourceId,
    matchesLayerSourceFilter,
    KIND_BUILT_IN,
    KIND_EARTH_ENGINE,
    KIND_EXTERNAL,
    PLACEMENT_BASEMAP,
    PLACEMENT_OVERLAY,
} from '../../util/layerSources.js'
```

Read `basemaps` alongside `defaultLayerSources` from the cached data:

```js
const { defaultLayerSources, basemaps } = useCachedData()
```

Replace the `allSources` composition with one that tags basemaps. `useCachedData().basemaps`
is already `defaultBasemaps()` filtered by API key validation plus the external basemaps, so
it is exactly the set an author can use:

```js
// PROTOTYPE ONLY - mock sources are appended so the dialog is worth scrolling
const basemapSources = [...basemaps, ...mockBasemapSources()].map(
    (basemap) => ({ ...basemap, placement: PLACEMENT_BASEMAP })
)

const allSources = [
    ...defaultLayerSources,
    ...mockLayerSources(),
    ...basemapSources,
    ...addedSources,
]
```

`getLayerSourceKind()` needs no change: external basemaps carry `layer: EXTERNAL_LAYER` and
land in `KIND_EXTERNAL`; `defaultBasemaps()` entries carry no `layer` and fall through to
`KIND_BUILT_IN`. The existing `groups` definition therefore picks them up as is - but the
built-in group is unsorted today, so basemaps land after the data layer types, which is the
order the spec asks for. Leave `groups` alone.

-   [ ] **Step 4: Add the Placement filter options and state**

Add the options constant next to `STATUS_OPTIONS` and `KIND_OPTIONS`:

```js
const PLACEMENT_OPTIONS = [
    { value: ALL, label: i18n.t('All') },
    {
        value: PLACEMENT_OVERLAY,
        label: getLayerSourcePlacementLabel(PLACEMENT_OVERLAY),
    },
    {
        value: PLACEMENT_BASEMAP,
        label: getLayerSourcePlacementLabel(PLACEMENT_BASEMAP),
    },
]
```

Add the state next to the other filters:

```js
const [placementFilter, setPlacementFilter] = useState(ALL)
```

-   [ ] **Step 5: Apply the filter**

Extend the `filteredGroups` source filter with a placement check:

```js
const matchesPlacement = (source) =>
    placementFilter === ALL ||
    getLayerSourcePlacement(source) === placementFilter

const filteredGroups = groups
    .filter((group) => kindFilter === ALL || group.kind === kindFilter)
    .map((group) => ({
        ...group,
        sources: group.sources.filter(
            (l) =>
                matchesLayerSourceFilter(l, filter) &&
                matchesStatus(group.kind, l) &&
                matchesPlacement(l)
        ),
    }))
    .filter((group) => group.sources.length)
```

Earth Engine sources are always overlays, so selecting Basemap empties that group and the
existing trailing `.filter` drops it.

-   [ ] **Step 6: Reset the new filter after adding a source**

In `onAddSource`, next to the existing three resets:

```js
// Clear the filters so the new row is definitely visible
setFilter('')
setStatusFilter(ALL)
setKindFilter(ALL)
setPlacementFilter(ALL)
```

-   [ ] **Step 7: Render the third select**

In the `listContent` toolbar, after the existing Type select block, add:

```jsx
<div className={styles.select}>
    <SingleSelect
        dense
        prefix={i18n.t('Placement')}
        selected={placementFilter}
        onChange={({ selected }) => setPlacementFilter(selected)}
        dataTest="managelayersources-placement"
    >
        {PLACEMENT_OPTIONS.map(({ value, label }) => (
            <SingleSelectOption key={value} value={value} label={label} />
        ))}
    </SingleSelect>
</div>
```

-   [ ] **Step 8: Add the last-basemap guard and pass the new props through**

Above the `listContent` definition, compute how many basemaps are still enabled:

```js
// The map needs somewhere to render - never let the admin switch the last
// basemap off
const enabledBasemapCount = basemapSources.filter((basemap) =>
    isEnabled(getLayerSourceKind(basemap), getManagedLayerSourceId(basemap))
).length

const lockedReason = i18n.t('At least one basemap must stay enabled')
```

Then replace the `<LayerSource ... />` call inside the group render with:

```jsx
{
    sources.map((layerSource) => {
        const id = getManagedLayerSourceId(layerSource)
        const enabled = isEnabled(kind, id)
        const placement = getLayerSourcePlacement(layerSource)
        const isLocked =
            placement === PLACEMENT_BASEMAP &&
            enabled &&
            enabledBasemapCount === 1
        return (
            <LayerSource
                key={`${kind}-${id}`}
                layerSource={layerSource}
                isAdded={enabled}
                isNew={layerSource.isNew}
                placement={placement}
                isLocked={isLocked}
                lockedReason={lockedReason}
                onToggle={() => onToggle(kind, id, enabled)}
            />
        )
    })
}
```

Note the `key`: built-in and external basemaps have distinct ids, and the `${kind}-` prefix
already keeps them apart from any overlay that happens to share one.

-   [ ] **Step 9: Give the toolbar room for a third select**

In `src/components/layerSources/styles/ManageLayerSourcesModal.module.css`, the search input
currently takes most of the row. Loosen it so three selects fit without wrapping awkwardly:

```css
.search {
    flex: 3 1 auto;
    min-width: 160px;
}

.select {
    flex: 1 1 140px;
}
```

-   [ ] **Step 10: Verify lint passes**

Run: `yarn lint`
Expected: no errors in the three touched files.

-   [ ] **Step 11: Manual check**

Run: `yarn start`, Maps → **Add layer** → **Configure available layer sources**.
Expected:

-   Built-in basemaps (OSM Light, OSM Detailed, Sentinel-2 EOX, and whichever Bing/Azure
    entries the instance has keys for) appear under **Built-in**, after the data layer types,
    each with a grey **Basemap** pill and Service/Host meta chips.
-   The three mock basemaps appear under **External data** with the same pill.
-   **Placement: Basemap** shows only basemap rows and hides the Earth Engine group entirely.
-   **Placement: Overlay** hides every basemap row.
-   Placement combines with Status and Type - e.g. Type: Built-in + Placement: Basemap shows
    only the built-in basemaps.
-   Disable basemaps one by one; when one is left, its checkbox is greyed out and clicking the
    row does nothing. Hovering it shows "At least one basemap must stay enabled".
-   The footer count grows to include the basemaps.

-   [ ] **Step 12: Commit**

```bash
git add src/components/layerSources/LayerSource.jsx src/components/layerSources/styles/LayerSource.module.css src/components/layerSources/ManageLayerSourcesModal.jsx src/components/layerSources/styles/ManageLayerSourcesModal.module.css
git -c commit.gpgsign=false commit -m "feat: manage basemaps in the layer sources modal (prototype)"
```

---

### Task 5: Adding a source as a basemap

Turns the Add source form's existing "Layer position: Basemap" option from a dead end into a
real basemap.

**Files:**

-   Modify: `src/components/layerSources/ManageLayerSourcesModal.jsx`

-   [ ] **Step 1: Import the basemap factory**

Change the external util import:

```js
import {
    createExternalBasemapLayer,
    createExternalOverlayLayer,
} from '../../util/external.js'
```

-   [ ] **Step 2: Rewrite `onAddSource`**

Replace the whole function with:

```js
const onAddSource = () => {
    // Unique per add: the disabled list is persisted to localStorage, so a
    // reused id would inherit a stale "disabled" flag from an earlier source
    const model = getExternalLayerModel(
        form,
        `prototype-${Date.now().toString(36)}`
    )
    const isBasemap = model.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP

    addSource(
        isBasemap
            ? {
                  ...createExternalBasemapLayer(model),
                  placement: PLACEMENT_BASEMAP,
                  isNew: true,
              }
            : { ...createExternalOverlayLayer(model), isNew: true }
    )

    setNotice(
        isBasemap
            ? i18n.t(
                  '"{{name}}" was added as a basemap and is available on the Basemap card.',
                  { name: model.name }
              )
            : i18n.t('"{{name}}" was added and is enabled for all users.', {
                  name: model.name,
              })
    )

    // Clear the filters so the new row is definitely visible
    setFilter('')
    setStatusFilter(ALL)
    setKindFilter(ALL)
    setPlacementFilter(ALL)
    closeAddView()
}
```

`createExternalBasemapLayer(model)` returns `{ layer, id, name, config }` - it keeps the
top-level `id`, which is what `getManagedLayerSourceId` and the Basemap card's `selectedID`
comparison both need. `createExternalOverlayLayer(model)` deliberately has no top-level `id`
(overlays are identified by `config.id`), so the two branches are not symmetric and should
not be made so.

-   [ ] **Step 3: Confirm nothing still references the removed basemap dead-end**

Run: `grep -n "not listed here\|basemap layers are configured" src/components/layerSources/ManageLayerSourcesModal.jsx`
Expected: no output.

-   [ ] **Step 4: Verify lint passes**

Run: `yarn lint`
Expected: no errors.

-   [ ] **Step 5: Manual check**

Run: `yarn start`, Maps → **Add layer** → **Configure available layer sources** →
**Add source**. Fill in Name "Test basemap", Map service **XYZ**, URL
`https://example.org/tiles/test/{z}/{x}/{y}.png`, Layer position **Basemap**. Submit.
Expected: the list returns with a green-ish info notice saying it is available on the Basemap
card, and a new row under **External data** carrying both the **Basemap** and **Added in this
session** pills. Repeat with Layer position **Overlay** and confirm that row has no Basemap
pill.

-   [ ] **Step 6: Commit**

```bash
git add src/components/layerSources/ManageLayerSourcesModal.jsx
git -c commit.gpgsign=false commit -m "feat: register new sources as basemaps (prototype)"
```

---

### Task 6: Basemap card reflects the admin's choices

Makes the toggles visibly do something, and adds the "More basemaps…" select.

**Files:**

-   Modify: `src/components/layers/basemaps/BasemapList.jsx`
-   Modify: `src/components/layers/basemaps/styles/BasemapList.module.css`

-   [ ] **Step 1: Rewrite `BasemapList`**

Replace the whole of `src/components/layers/basemaps/BasemapList.jsx` with:

```jsx
import i18n from '@dhis2/d2-i18n'
import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { mockBasemapSources } from '../../../constants/mockLayerSources.js'
import useAddedLayerSources from '../../../hooks/useAddedLayerSources.js'
import useLayerCatalogPrefs from '../../../hooks/useLayerCatalogPrefs.js'
import {
    getLayerSourcePlacement,
    getManagedLayerSourceId,
    PLACEMENT_BASEMAP,
} from '../../../util/layerSources.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import Basemap from './Basemap.jsx'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, selectBasemap }) => {
    const { basemaps } = useCachedData()
    const { addedSources } = useAddedLayerSources()
    const { isDisabled } = useLayerCatalogPrefs()
    const [showAll, setShowAll] = useState(false)

    // PROTOTYPE ONLY - mock basemaps and basemaps registered in the manage
    // dialog are merged in here, and anything an admin switched off is dropped
    const addedBasemaps = addedSources.filter(
        (source) => getLayerSourcePlacement(source) === PLACEMENT_BASEMAP
    )
    const enabledBasemaps = [
        ...basemaps,
        ...mockBasemapSources(),
        ...addedBasemaps,
    ].filter((basemap) => !isDisabled(getManagedLayerSourceId(basemap)))

    return (
        <div className={styles.basemapList} data-test="basemaplist">
            <div className={styles.tiles}>
                {enabledBasemaps.map((basemap, index) => (
                    <Basemap
                        key={`basemap-${index}`}
                        onClick={selectBasemap}
                        isSelected={basemap.id === selectedID}
                        {...basemap}
                    />
                ))}
            </div>
            <button
                type="button"
                className={styles.moreButton}
                onClick={() => setShowAll(!showAll)}
                data-test="basemaplist-more"
            >
                {showAll ? i18n.t('Hide list') : i18n.t('More basemaps…')}
            </button>
            {showAll && (
                <div className={styles.moreSelect}>
                    <SingleSelect
                        dense
                        selected={
                            enabledBasemaps.some((b) => b.id === selectedID)
                                ? selectedID
                                : ''
                        }
                        placeholder={i18n.t('Choose a basemap')}
                        onChange={({ selected }) => {
                            const basemap = enabledBasemaps.find(
                                (b) => b.id === selected
                            )
                            if (basemap) {
                                selectBasemap({
                                    id: basemap.id,
                                    config: basemap.config,
                                })
                            }
                        }}
                        dataTest="basemaplist-select"
                    >
                        {enabledBasemaps.map((basemap) => (
                            <SingleSelectOption
                                key={basemap.id}
                                value={basemap.id}
                                label={basemap.name}
                            />
                        ))}
                    </SingleSelect>
                </div>
            )}
        </div>
    )
}

BasemapList.propTypes = {
    selectBasemap: PropTypes.func.isRequired,
    selectedID: PropTypes.string.isRequired,
}

export default BasemapList
```

The `selectBasemap({ id, config })` shape matches exactly what `Basemap.jsx` already passes
to the same handler, so the redux action is unchanged.

-   [ ] **Step 2: Update the styles**

The scroll container now holds a button too, so the tiles need their own wrapper. Replace the
whole of `src/components/layers/basemaps/styles/BasemapList.module.css` with:

```css
.basemapList {
    max-height: 270px;
    overflow-y: auto;
    margin-left: 7px;
}

.tiles {
    display: flow-root;
}

.moreButton {
    display: block;
    margin: var(--spacers-dp8) 0 var(--spacers-dp4);
    padding: 0;
    border: none;
    background: none;
    color: var(--colors-blue700);
    font-size: 13px;
    cursor: pointer;
}

.moreSelect {
    margin-block-end: var(--spacers-dp8);
    padding-inline-end: var(--spacers-dp8);
}
```

-   [ ] **Step 3: Verify lint passes**

Run: `yarn lint`
Expected: no errors in the two touched files.

-   [ ] **Step 4: Manual check - the full loop**

Run: `yarn start`, Maps. In the layers panel, expand the **Basemap** card.
Expected:

-   The tile grid looks as before, plus placeholder tiles for the three mock basemaps.
-   **More basemaps…** opens a select listing every enabled basemap by name; choosing one
    switches the map's basemap and highlights the matching tile.
-   With the Basemap card still expanded, open **Add layer** → **Configure available layer
    sources** and disable a basemap. Close the modal: that basemap's tile is gone from the card
    and from the select, with no page reload.
-   Re-enable it and it comes back.
-   Add a new source with Layer position **Basemap**; it appears on the card as a placeholder
    tile and in the select, and can be selected.
-   Add a new source with Layer position **Overlay**; it appears in the Add layer catalog and
    _not_ on the Basemap card.
-   The Add layer catalog popover shows no basemaps and has no Placement control.

-   [ ] **Step 5: Commit**

```bash
git add src/components/layers/basemaps/BasemapList.jsx src/components/layers/basemaps/styles/BasemapList.module.css
git -c commit.gpgsign=false commit -m "feat: honour managed basemaps on the basemap card (prototype)"
```

---

## Final verification

-   [ ] **Run the full lint pass**

Run: `yarn lint`
Expected: clean.

-   [ ] **Run the existing test suite to confirm nothing regressed**

Run: `yarn test`
Expected: the pre-existing suites (`OverlayCard`, `LayerToolbar`, `favorites`, `basemaps`)
still pass. `src/util/__tests__/` includes tests that touch `getBasemapList` and favorites -
neither is modified by this plan, so any failure there is a real regression, most likely from
the `getManagedLayerSourceId` change in Task 1.

-   [ ] **Confirm the prototype is still clearly marked as one**

Run: `grep -rn "PROTOTYPE ONLY" src/hooks/prototypeStore.js src/hooks/useAddedLayerSources.js src/hooks/useLayerCatalogPrefs.js src/constants/mockLayerSources.js src/components/layerSources/ManageLayerSourcesModal.jsx src/components/layers/basemaps/BasemapList.jsx`
Expected: at least one hit in each file.
