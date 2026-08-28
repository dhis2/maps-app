# Add layer source modal - design

Date: 2026-08-27
Branch: `layer-catalog-prototype`
Status: approved, throwaway prototype

## Context

The layer catalog prototype added a "Configure available layer sources" modal
(`ManageLayerSourcesModal`) where an admin enables/disables the layer sources
available to map authors. Its list header has an `Add source` button that is
currently disabled behind a "Coming soon" tooltip.

This design fills that button in: an in-modal form for registering a new
external layer source, modelled on the External map layer screen in the
Maintenance app.

## Goals

-   Mock up the Add source flow well enough to demo and get feedback on.
-   Stay inside what the backend already supports. Every field maps 1:1 to an
    existing `externalMapLayers` property, so nothing here implies backend work.
-   Speed over durability. This is a prototype and is expected to be deleted.

## Non-goals

-   Editing or deleting existing sources.
-   Writing to the API. No `POST /api/externalMapLayers`.
-   Persistence across reloads.
-   Registering Earth Engine or built-in sources (those are not user-creatable).
-   URL reachability / capabilities probing ("test this WMS"), which no endpoint
    supports today.

## Navigation

`ManageLayerSourcesModal` holds `view: 'list' | 'add'`. The same `<Modal large>`
stays mounted and swaps its content, title and actions:

```
+- Add layer source ------------------------------- x
|  < Back to all sources
|  -----------------------------------------------
|  [ form fields ]
|
|                            [ Cancel ] [ Add source ]
+---------------------------------------------------
```

-   `ModalTitle` becomes "Add layer source".
-   A borderless back button sits at the top of the content.
-   `ModalActions` becomes `Cancel` (back to list) + `Add source` (primary,
    disabled until the form is valid). The "N of M sources enabled" counter is
    hidden in the add view.
-   The list header's `Add source` button loses its "Coming soon" tooltip wrapper
    and sets `view: 'add'`.
-   Escape in the add view returns to the list instead of closing the modal.
    Note: this cannot be done with the app's own `useKeyDown('Escape', ...)`.
    `@dhis2/ui`'s `Modal` registers its own **document-level** Escape handler
    (`@dhis2-ui/modal/.../modal.js`) that calls `onClose` and then
    `stopPropagation()`, so the event never reaches the window listener
    `useKeyDown` installs - the app's handler is dead code for Escape and always
    was. The working approach is to make the Modal's own `onClose` view-aware:
    `onClose={isAddView ? closeAddView : onClose}`, which also makes a backdrop
    click back out of the form rather than discarding it.
-   Returning to the list resets the search, status and type filters so a newly
    added row is visible.

## Form fields

Full parity with the Maintenance app's External map layer form. Field set is
exactly what `EXTERNAL_MAP_LAYERS_QUERY` in `src/util/requests.js` already
requests.

| Field          | Control     | Required | Notes                                     |
| -------------- | ----------- | -------- | ----------------------------------------- |
| Name           | InputField  | yes      |                                           |
| Code           | InputField  | no       | free text, no uniqueness check            |
| Map service    | SelectField | yes      | WMS, XYZ, TMS, Vector style, GeoJSON URL  |
| URL            | InputField  | yes      | placeholder and help text vary by service |
| Layers         | InputField  | when WMS | hidden unless WMS                         |
| Image format   | SelectField | no       | PNG / JPG; hidden unless WMS/XYZ/TMS      |
| Layer position | SelectField | no       | Overlay (default) / Basemap               |
| Attribution    | InputField  | no       |                                           |
| Legend set     | SelectField | no       | live `legendSets` query, read-only        |
| Legend set URL | InputField  | no       |                                           |

The map service options are the keys of `mapServiceToTypeMap` in
`src/util/external.js` (`supportedMapServices`) - the services the app can
actually render.

Deliberate deviation from Maintenance: `Layers` and `Image format` are hidden
for Vector style and GeoJSON URL, because `createExternalLayerConfig` ignores
them for those services.

### Validation

Client-side only, computed on each render:

-   Name non-empty.
-   Map service selected.
-   URL non-empty and parses via `new URL()`.
-   Layers non-empty when map service is WMS.

Errors show on the field via `@dhis2/ui` `InputField`'s `error` /
`validationText` (the local `core/TextField` wrapper does not expose these, so
the form uses `InputField` directly). `Add source` is disabled while invalid.

## Save behaviour

Local mock only. On submit:

1. Build an API-shaped model from the form state (`{ id, name, code, mapService,
url, layers, imageFormat, mapLayerPosition, attribution, legendSet,
legendSetUrl }`) with a generated id.
2. Pass it through `createExternalOverlayLayer()` from `src/util/external.js` -
   the same transform the live API path uses - so the new entry renders
   identically to a real one and gets its Service/Host meta chips from
   `getLayerSourceMeta` for free.
3. Append to `addedSources` state in `ManageLayerSourcesModal`, which is
   concatenated into `allSources`.
4. Return to the list view.

The new source is enabled by default with no extra code: built-in and external
sources use the prototype deny-list (`useLayerCatalogPrefs.isDisabled`), and a
source that has never been disabled is enabled.

Two supporting behaviours:

-   The new row renders an "Added in this session" pill, via a new optional
    `isNew` prop on `LayerSource`.
-   If Layer position is Basemap, no row is added. Instead the list view shows a
    one-line info note that basemap layers are configured elsewhere and are not
    listed here. This matches the real filter in `getDefaultLayerSources`
    (`src/util/app.js`), which drops `MAP_LAYER_POSITION_BASEMAP` entries.

State is lost on reload. That is accepted.

## Files

New:

-   `src/components/layerSources/AddLayerSourceForm.jsx`
-   `src/components/layerSources/styles/AddLayerSourceForm.module.css`

Changed:

-   `src/components/layerSources/ManageLayerSourcesModal.jsx` - view state,
    title/back/actions switching, `addedSources`, basemap note, enabled
    `Add source` button.
-   `src/components/layerSources/styles/ManageLayerSourcesModal.module.css` - back
    button and info notice styles.
-   `src/components/layerSources/LayerSource.jsx` - optional `isNew` pill.
-   `src/components/layerSources/styles/LayerSource.module.css` - pill styles.

All new code carries a `PROTOTYPE ONLY` comment in the style of the existing
prototype files (`mockLayerSources.js`, `useLayerCatalogPrefs.js`).

## Testing

No automated tests. This is a throwaway prototype and the repo has no tests for
the surrounding prototype components. Verification is `yarn lint` clean plus a
manual pass through the flow: open the modal, add an XYZ source, add a WMS
source, check required-field blocking, check Escape and back navigation, check
the basemap note.
