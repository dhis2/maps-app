# Add Layer Source Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the disabled "Add source" button in the layer source catalog modal with an in-modal form that mocks up registering a new external layer source.

**Architecture:** `ManageLayerSourcesModal` gains a `view` state and swaps its own content between the existing list and a new `AddLayerSourceForm`. The form owns presentation and validation; the modal owns the form data and the list of added sources. On submit the form model is passed through the app's real `createExternalOverlayLayer()` transform and appended to session state - no API writes.

**Tech Stack:** React 18, `@dhis2/ui` (Modal, InputField, SingleSelectField, Button), `@dhis2/app-runtime` (`useDataQuery` for legend sets), CSS modules, `@dhis2/d2-i18n`.

**Spec:** `docs/superpowers/specs/2026-08-27-add-layer-source-modal-design.md`

**No automated tests.** This is a throwaway prototype on the `layer-catalog-prototype` branch; the surrounding prototype components (`mockLayerSources.js`, `useLayerCatalogPrefs.js`, `LayerSourceRow.jsx`) have none either. Verification is lint + a scripted manual pass (Task 4). Do not add Jest or Cypress specs for this.

---

## File Structure

**Create:**

-   `src/components/layerSources/AddLayerSourceForm.jsx` - the form view. Renders the fields, owns per-field "touched" state, and exports three pure helpers (`EMPTY_FORM`, `getFormErrors`, `getExternalLayerModel`) so the modal can compute validity and build the API-shaped model without duplicating field knowledge.
-   `src/components/layerSources/styles/AddLayerSourceForm.module.css` - two-column form grid.

**Modify:**

-   `src/components/layerSources/ManageLayerSourcesModal.jsx` - view switching, form data, added sources, the info notice, and enabling the `Add source` button.
-   `src/components/layerSources/styles/ManageLayerSourcesModal.module.css` - `.back` and `.notice`.
-   `src/components/layerSources/LayerSource.jsx` - optional `isNew` pill.
-   `src/components/layerSources/styles/LayerSource.module.css` - `.newPill`.

**Do not touch:** `src/util/external.js`, `src/util/app.js`, `src/util/requests.js`, `src/util/layerSources.js`. The form consumes `supportedMapServices` and `createExternalOverlayLayer` as they already are - that is what keeps this honest about backend support.

---

## Task 1: The form component

**Files:**

-   Create: `src/components/layerSources/AddLayerSourceForm.jsx`
-   Create: `src/components/layerSources/styles/AddLayerSourceForm.module.css`

Background you need: `supportedMapServices` in `src/util/external.js` is `['WMS', 'TMS', 'XYZ', 'VECTOR_STYLE', 'GEOJSON_URL']` - the map services the app can actually render. Deriving the dropdown from it means the form cannot offer something unsupported. `MAP_LAYER_POSITION_BASEMAP` / `MAP_LAYER_POSITION_OVERLAY` are `'BASEMAP'` / `'OVERLAY'` in `src/constants/layers.js`.

The local `core/TextField` wrapper does not expose `error` / `validationText` / `required`, so use `@dhis2/ui` `InputField` directly.

-   [ ] **Step 1: Create the form component**

Write `src/components/layerSources/AddLayerSourceForm.jsx`:

```jsx
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
    MAP_LAYER_POSITION_BASEMAP,
    MAP_LAYER_POSITION_OVERLAY,
} from '../../constants/layers.js'
import { supportedMapServices } from '../../util/external.js'
import styles from './styles/AddLayerSourceForm.module.css'

// PROTOTYPE ONLY - mocks the "Add source" flow of the layer source catalog.
// The field set mirrors the External map layer form in the Maintenance app and
// every field maps 1:1 to an externalMapLayers property, but nothing is ever
// written to the API - see ManageLayerSourcesModal.onAddSource().

const LEGEND_SETS_QUERY = {
    legendSets: {
        resource: 'legendSets',
        params: {
            fields: ['id', 'displayName~rename(name)'],
            paging: false,
        },
    },
}

const WMS = 'WMS'
const RASTER_SERVICES = ['WMS', 'XYZ', 'TMS']

// Labels for the services the app supports - the option list itself is derived
// from supportedMapServices so it can never offer an unsupported one
const MAP_SERVICE_LABELS = {
    WMS: i18n.t('WMS'),
    XYZ: i18n.t('XYZ tiles'),
    TMS: i18n.t('TMS tiles'),
    VECTOR_STYLE: i18n.t('Vector style'),
    GEOJSON_URL: i18n.t('GeoJSON URL'),
}

const MAP_SERVICE_OPTIONS = supportedMapServices.map((value) => ({
    value,
    label: MAP_SERVICE_LABELS[value] || value,
}))

const IMAGE_FORMAT_OPTIONS = [
    { value: 'PNG', label: i18n.t('PNG') },
    { value: 'JPG', label: i18n.t('JPG') },
]

const POSITION_OPTIONS = [
    { value: MAP_LAYER_POSITION_OVERLAY, label: i18n.t('Overlay') },
    { value: MAP_LAYER_POSITION_BASEMAP, label: i18n.t('Basemap') },
]

const URL_PLACEHOLDER = {
    WMS: 'https://example.org/geoserver/wms',
    XYZ: 'https://example.org/tiles/{z}/{x}/{y}.png',
    TMS: 'https://example.org/tiles/{z}/{x}/{y}.png',
    VECTOR_STYLE: 'https://example.org/styles/style.json',
    GEOJSON_URL: 'https://example.org/data/districts.geojson',
}

const URL_HELP = {
    WMS: i18n.t('Base URL of the WMS service, without query parameters'),
    XYZ: i18n.t('Tile URL template with {z}/{x}/{y} placeholders'),
    TMS: i18n.t('Tile URL template, using TMS tile ordering'),
    VECTOR_STYLE: i18n.t('URL of a vector style JSON document'),
    GEOJSON_URL: i18n.t('URL of a GeoJSON FeatureCollection'),
}

export const EMPTY_FORM = {
    name: '',
    code: '',
    mapService: 'XYZ',
    url: '',
    layers: '',
    imageFormat: 'PNG',
    mapLayerPosition: MAP_LAYER_POSITION_OVERLAY,
    attribution: '',
    legendSet: null,
    legendSetUrl: '',
}

const isValidUrl = (value) => {
    try {
        return Boolean(new URL(value))
    } catch {
        return false
    }
}

// Keyed by field name so the form can show each message on its own field
export const getFormErrors = (form) => {
    const errors = {}

    if (!form.name.trim()) {
        errors.name = i18n.t('A name is required')
    }

    if (!form.url.trim()) {
        errors.url = i18n.t('A URL is required')
    } else if (!isValidUrl(form.url.trim())) {
        errors.url = i18n.t('Enter a full URL, including https://')
    }

    if (form.mapService === WMS && !form.layers.trim()) {
        errors.layers = i18n.t('WMS services need at least one layer name')
    }

    return errors
}

// An API-shaped externalMapLayer, ready for createExternalOverlayLayer().
// Fields the app ignores for the chosen service are left out entirely.
export const getExternalLayerModel = (form, id) => ({
    id,
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    mapService: form.mapService,
    url: form.url.trim(),
    layers: form.mapService === WMS ? form.layers.trim() : undefined,
    imageFormat: RASTER_SERVICES.includes(form.mapService)
        ? form.imageFormat
        : undefined,
    mapLayerPosition: form.mapLayerPosition,
    attribution: form.attribution.trim() || undefined,
    legendSet: form.legendSet || undefined,
    legendSetUrl: form.legendSetUrl.trim() || undefined,
})

const AddLayerSourceForm = ({ form, errors, onChange }) => {
    // Errors only show once a field has been visited, so an untouched form
    // isn't covered in red the moment it opens
    const [touched, setTouched] = useState({})
    const { loading, data } = useDataQuery(LEGEND_SETS_QUERY)

    const legendSets = data?.legendSets?.legendSets ?? []
    const isWms = form.mapService === WMS
    const isRaster = RASTER_SERVICES.includes(form.mapService)

    const textField = (field) => ({
        dense: true,
        value: form[field],
        error: Boolean(touched[field] && errors[field]),
        validationText: touched[field] ? errors[field] : undefined,
        onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
        onChange: ({ value }) => onChange(field, value),
    })

    return (
        <div className={styles.form}>
            <div className={styles.sectionTitle}>{i18n.t('Service')}</div>
            <InputField
                {...textField('name')}
                className={styles.full}
                required
                label={i18n.t('Name')}
                dataTest="addlayersource-name"
            />
            <SingleSelectField
                dense
                required
                label={i18n.t('Map service')}
                selected={form.mapService}
                onChange={({ selected }) => onChange('mapService', selected)}
                dataTest="addlayersource-mapservice"
            >
                {MAP_SERVICE_OPTIONS.map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            <InputField
                {...textField('code')}
                label={i18n.t('Code')}
                dataTest="addlayersource-code"
            />
            <InputField
                {...textField('url')}
                className={styles.full}
                required
                label={i18n.t('URL')}
                placeholder={URL_PLACEHOLDER[form.mapService]}
                helpText={URL_HELP[form.mapService]}
                dataTest="addlayersource-url"
            />
            {isWms && (
                <InputField
                    {...textField('layers')}
                    className={styles.full}
                    required
                    label={i18n.t('Layers')}
                    placeholder="district_boundaries,facilities"
                    helpText={i18n.t(
                        'Comma separated WMS layer names, as published by the service'
                    )}
                    dataTest="addlayersource-layers"
                />
            )}
            {isRaster && (
                <SingleSelectField
                    dense
                    label={i18n.t('Image format')}
                    selected={form.imageFormat}
                    onChange={({ selected }) =>
                        onChange('imageFormat', selected)
                    }
                    dataTest="addlayersource-imageformat"
                >
                    {IMAGE_FORMAT_OPTIONS.map(({ value, label }) => (
                        <SingleSelectOption
                            key={value}
                            value={value}
                            label={label}
                        />
                    ))}
                </SingleSelectField>
            )}
            <SingleSelectField
                dense
                label={i18n.t('Layer position')}
                selected={form.mapLayerPosition}
                helpText={
                    form.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP
                        ? i18n.t('Basemaps are not listed in this catalog')
                        : undefined
                }
                onChange={({ selected }) =>
                    onChange('mapLayerPosition', selected)
                }
                dataTest="addlayersource-position"
            >
                {POSITION_OPTIONS.map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            <div className={styles.sectionTitle}>
                {i18n.t('Attribution and legend')}
            </div>
            <InputField
                {...textField('attribution')}
                className={styles.full}
                label={i18n.t('Attribution')}
                helpText={i18n.t(
                    'Credit shown in the attribution control on the map'
                )}
                dataTest="addlayersource-attribution"
            />
            <SingleSelectField
                dense
                clearable
                clearText={i18n.t('Clear')}
                loading={loading}
                loadingText={i18n.t('Loading legend sets')}
                label={i18n.t('Legend set')}
                selected={form.legendSet?.id ?? ''}
                onChange={({ selected }) =>
                    onChange(
                        'legendSet',
                        legendSets.find((ls) => ls.id === selected) ?? null
                    )
                }
                dataTest="addlayersource-legendset"
            >
                {legendSets.map(({ id, name }) => (
                    <SingleSelectOption key={id} value={id} label={name} />
                ))}
            </SingleSelectField>
            <InputField
                {...textField('legendSetUrl')}
                label={i18n.t('Legend set URL')}
                dataTest="addlayersource-legendseturl"
            />
        </div>
    )
}

AddLayerSourceForm.propTypes = {
    errors: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default AddLayerSourceForm
```

-   [ ] **Step 2: Create the form styles**

Write `src/components/layerSources/styles/AddLayerSourceForm.module.css`:

```css
.form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
    gap: var(--spacers-dp8) var(--spacers-dp16);
    max-width: 760px;
    padding-block-end: var(--spacers-dp16);
}

.full {
    grid-column: 1 / -1;
}

.sectionTitle {
    grid-column: 1 / -1;
    margin-block-start: var(--spacers-dp8);
    padding-block-end: var(--spacers-dp4);
    border-bottom: 1px solid var(--colors-grey300);
    font-size: 14px;
    font-weight: 500;
    color: var(--colors-grey700);
}
```

-   [ ] **Step 3: Lint the new files**

Run:

```bash
npx prettier --write src/components/layerSources/AddLayerSourceForm.jsx src/components/layerSources/styles/AddLayerSourceForm.module.css && npx eslint src/components/layerSources --ext .js,.jsx
```

Expected: prettier lists the two files, eslint exits 0 with no output. If eslint reports `react/jsx-sort-props` or `import/order`, fix by reordering as instructed - do not add eslint-disable comments.

-   [ ] **Step 4: Commit**

```bash
git add src/components/layerSources/AddLayerSourceForm.jsx src/components/layerSources/styles/AddLayerSourceForm.module.css
git commit -m "feat: add layer source form (prototype)"
```

---

## Task 2: Wire the form into the modal

**Files:**

-   Modify: `src/components/layerSources/ManageLayerSourcesModal.jsx` (full replacement below)
-   Modify: `src/components/layerSources/styles/ManageLayerSourcesModal.module.css` (append two rules)

This task does the view switching **and** the save behaviour together - they share the same state block and splitting them would leave the modal in a half-wired state that cannot be checked by hand.

What changes, and why:

-   `view` state swaps `ModalTitle`, content and `ModalActions`. The list JSX moves into a `listContent` const so the `return` stays readable.
-   `Tooltip` import is dropped (the "Coming soon" wrapper is gone); `IconArrowLeft16` and `IconInfo16` are added.
-   `useKeyDown('Escape', ...)` now calls `onEscape`, which backs out of the add view instead of closing the whole modal.
-   `addedSources` are appended to `allSources`, so they flow through the existing grouping, filtering and counting untouched. They are enabled automatically: built-in and external sources use the deny-list in `useLayerCatalogPrefs`, and a source that was never disabled is enabled.
-   A `BASEMAP` position adds nothing to the list and explains why, matching the real filter in `getDefaultLayerSources` (`src/util/app.js:37`).

-   [ ] **Step 1: Replace `ManageLayerSourcesModal.jsx`**

Write the file in full:

```jsx
import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
    Input,
    SingleSelect,
    SingleSelectOption,
    IconAdd16,
    IconArrowLeft16,
    IconInfo16,
    IconSearch16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import getEarthEngineLayers from '../../constants/earthEngineLayers/index.js'
import { MAP_LAYER_POSITION_BASEMAP } from '../../constants/layers.js'
import { mockLayerSources } from '../../constants/mockLayerSources.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import useLayerCatalogPrefs from '../../hooks/useLayerCatalogPrefs.js'
import useManagedLayerSourcesStore from '../../hooks/useManagedLayerSourcesStore.js'
import { createExternalOverlayLayer } from '../../util/external.js'
import {
    getLayerSourceKind,
    getLayerSourceKindLabel,
    getManagedLayerSourceId,
    matchesLayerSourceFilter,
    KIND_BUILT_IN,
    KIND_EARTH_ENGINE,
    KIND_EXTERNAL,
} from '../../util/layerSources.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import AddLayerSourceForm, {
    EMPTY_FORM,
    getExternalLayerModel,
    getFormErrors,
} from './AddLayerSourceForm.jsx'
import LayerSource from './LayerSource.jsx'
import styles from './styles/ManageLayerSourcesModal.module.css'

const byName = (a, b) =>
    (a.name || a.type || '').localeCompare(b.name || b.type || '')

const nonLegacyEarthEngineLayers = getEarthEngineLayers()
    .filter((l) => !l.legacy)
    .sort(byName)

const ALL = 'all'
const STATUS_ENABLED = 'enabled'
const STATUS_DISABLED = 'disabled'

const STATUS_OPTIONS = [
    { value: ALL, label: i18n.t('All') },
    { value: STATUS_ENABLED, label: i18n.t('Enabled') },
    { value: STATUS_DISABLED, label: i18n.t('Disabled') },
]

const KIND_OPTIONS = [
    { value: ALL, label: i18n.t('All') },
    { value: KIND_BUILT_IN, label: getLayerSourceKindLabel(KIND_BUILT_IN) },
    {
        value: KIND_EARTH_ENGINE,
        label: getLayerSourceKindLabel(KIND_EARTH_ENGINE),
    },
    { value: KIND_EXTERNAL, label: getLayerSourceKindLabel(KIND_EXTERNAL) },
]

const VIEW_LIST = 'list'
const VIEW_ADD = 'add'

const ManageLayerSourcesModal = ({ onClose }) => {
    const { managedLayerSources, showLayerSource, hideLayerSource } =
        useManagedLayerSourcesStore()
    const { isDisabled, toggleDisabled } = useLayerCatalogPrefs()
    const { defaultLayerSources } = useCachedData()
    const [filter, setFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState(ALL)
    const [kindFilter, setKindFilter] = useState(ALL)
    const [view, setView] = useState(VIEW_LIST)
    // PROTOTYPE ONLY - sources added through the form live in component state
    // for the session. The real thing would POST to externalMapLayers.
    const [form, setForm] = useState(EMPTY_FORM)
    const [addedSources, setAddedSources] = useState([])
    const [notice, setNotice] = useState(null)

    const isAddView = view === VIEW_ADD

    const closeAddView = useCallback(() => {
        setView(VIEW_LIST)
        setForm(EMPTY_FORM)
    }, [])

    // Escape backs out of the form first, and only then closes the modal
    const onEscape = useCallback(() => {
        if (view === VIEW_ADD) {
            closeAddView()
        } else {
            onClose()
        }
    }, [view, closeAddView, onClose])

    useKeyDown('Escape', onEscape)

    // PROTOTYPE ONLY - mock sources are appended so the dialog is worth scrolling
    const allSources = [
        ...defaultLayerSources,
        ...mockLayerSources(),
        ...addedSources,
    ]

    const groups = [
        {
            kind: KIND_BUILT_IN,
            sources: allSources.filter(
                (l) => getLayerSourceKind(l) === KIND_BUILT_IN
            ),
        },
        { kind: KIND_EARTH_ENGINE, sources: nonLegacyEarthEngineLayers },
        {
            kind: KIND_EXTERNAL,
            sources: allSources
                .filter((l) => getLayerSourceKind(l) === KIND_EXTERNAL)
                .sort(byName),
        },
    ]

    // Earth Engine visibility is an allow-list held in the dataStore, while
    // built-in and external sources use the prototype deny-list
    const isEnabled = (kind, id) =>
        kind === KIND_EARTH_ENGINE
            ? managedLayerSources.includes(id)
            : !isDisabled(id)

    const onToggle = (kind, id, enabled) => {
        if (kind !== KIND_EARTH_ENGINE) {
            toggleDisabled(id)
        } else if (enabled) {
            hideLayerSource(id)
        } else {
            showLayerSource(id)
        }
    }

    const matchesStatus = (groupKind, source) => {
        if (statusFilter === ALL) {
            return true
        }
        const enabled = isEnabled(groupKind, getManagedLayerSourceId(source))
        return statusFilter === STATUS_ENABLED ? enabled : !enabled
    }

    const filteredGroups = groups
        .filter((group) => kindFilter === ALL || group.kind === kindFilter)
        .map((group) => ({
            ...group,
            sources: group.sources.filter(
                (l) =>
                    matchesLayerSourceFilter(l, filter) &&
                    matchesStatus(group.kind, l)
            ),
        }))
        .filter((group) => group.sources.length)

    const enabledCount = groups.reduce(
        (count, { kind, sources }) =>
            count +
            sources.filter((l) => isEnabled(kind, getManagedLayerSourceId(l)))
                .length,
        0
    )
    const totalCount = groups.reduce((n, g) => n + g.sources.length, 0)
    const visibleCount = filteredGroups.reduce(
        (n, g) => n + g.sources.length,
        0
    )

    const formErrors = getFormErrors(form)
    const canAddSource = Object.keys(formErrors).length === 0

    const onFormChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }))

    const openAddView = () => {
        setNotice(null)
        setView(VIEW_ADD)
    }

    const onAddSource = () => {
        const model = getExternalLayerModel(
            form,
            `prototype-${addedSources.length + 1}`
        )

        if (model.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP) {
            // Matches getDefaultLayerSources(), which drops basemap entries
            setNotice(
                i18n.t(
                    '"{{name}}" was added as a basemap, so it is not listed here. Basemaps are chosen on the map itself.',
                    { name: model.name }
                )
            )
        } else {
            setAddedSources((prev) => [
                ...prev,
                { ...createExternalOverlayLayer(model), isNew: true },
            ])
            setNotice(
                i18n.t('"{{name}}" was added and is enabled for all users.', {
                    name: model.name,
                })
            )
        }

        // Clear the filters so the new row is definitely visible
        setFilter('')
        setStatusFilter(ALL)
        setKindFilter(ALL)
        closeAddView()
    }

    const listContent = (
        <>
            <div className={styles.description}>
                {i18n.t(
                    'Choose which layer sources are available to add to maps. This selection applies to all users.'
                )}
            </div>
            {notice && (
                <div className={styles.notice}>
                    <IconInfo16 />
                    <span>{notice}</span>
                </div>
            )}
            <div className={styles.listHeader}>
                <span className={styles.listHeaderCount}>
                    {i18n.t('{{count}} layer sources', {
                        count: visibleCount,
                    })}
                </span>
                <Button
                    small
                    icon={<IconAdd16 />}
                    onClick={openAddView}
                    dataTest="managelayersources-addnew"
                >
                    {i18n.t('Add source')}
                </Button>
            </div>
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Input
                        dense
                        type="text"
                        prefixIcon={<IconSearch16 />}
                        value={filter}
                        clearable
                        placeholder={i18n.t('Filter layer sources')}
                        onChange={({ value }) => setFilter(value)}
                        dataTest="managelayersources-filter"
                    />
                </div>
                <div className={styles.select}>
                    <SingleSelect
                        dense
                        prefix={i18n.t('Status')}
                        selected={statusFilter}
                        onChange={({ selected }) => setStatusFilter(selected)}
                        dataTest="managelayersources-status"
                    >
                        {STATUS_OPTIONS.map(({ value, label }) => (
                            <SingleSelectOption
                                key={value}
                                value={value}
                                label={label}
                            />
                        ))}
                    </SingleSelect>
                </div>
                <div className={styles.select}>
                    <SingleSelect
                        dense
                        prefix={i18n.t('Type')}
                        selected={kindFilter}
                        onChange={({ selected }) => setKindFilter(selected)}
                        dataTest="managelayersources-kind"
                    >
                        {KIND_OPTIONS.map(({ value, label }) => (
                            <SingleSelectOption
                                key={value}
                                value={value}
                                label={label}
                            />
                        ))}
                    </SingleSelect>
                </div>
            </div>
            {filteredGroups.length === 0 && (
                <div className={styles.empty}>
                    {i18n.t('No layer sources match these filters.')}
                </div>
            )}
            {filteredGroups.map(({ kind, sources }) => (
                <div key={kind} className={styles.group}>
                    <div className={styles.groupTitle}>
                        {getLayerSourceKindLabel(kind)}
                    </div>
                    {sources.map((layerSource) => {
                        const id = getManagedLayerSourceId(layerSource)
                        const enabled = isEnabled(kind, id)
                        return (
                            <LayerSource
                                key={`${kind}-${id}`}
                                layerSource={layerSource}
                                isAdded={enabled}
                                isNew={layerSource.isNew}
                                onToggle={() => onToggle(kind, id, enabled)}
                            />
                        )
                    })}
                </div>
            ))}
        </>
    )

    const addContent = (
        <>
            <div className={styles.back}>
                <Button
                    small
                    secondary
                    icon={<IconArrowLeft16 />}
                    onClick={closeAddView}
                    dataTest="addlayersource-back"
                >
                    {i18n.t('Back to all sources')}
                </Button>
            </div>
            <div className={styles.description}>
                {i18n.t(
                    'Register an external map service. Once added it is available to all users, and can be disabled again from the list.'
                )}
            </div>
            <AddLayerSourceForm
                form={form}
                errors={formErrors}
                onChange={onFormChange}
            />
        </>
    )

    return (
        <Modal onClose={onClose} large dataTest="managelayersourcesmodal">
            <ModalTitle dataTest="managelayersourcesmodal-title">
                {isAddView
                    ? i18n.t('Add layer source')
                    : i18n.t('Configure available layer sources')}
            </ModalTitle>
            <ModalContent
                className={styles.content}
                dataTest="managelayersourcesmodal-content"
            >
                {isAddView ? addContent : listContent}
            </ModalContent>
            <ModalActions dataTest="managelayersourcesmodal-actions">
                {isAddView ? (
                    <ButtonStrip end>
                        <Button
                            secondary
                            onClick={closeAddView}
                            dataTest="addlayersource-cancel"
                        >
                            {i18n.t('Cancel')}
                        </Button>
                        <Button
                            primary
                            disabled={!canAddSource}
                            onClick={onAddSource}
                            dataTest="addlayersource-submit"
                        >
                            {i18n.t('Add source')}
                        </Button>
                    </ButtonStrip>
                ) : (
                    <div className={styles.actions}>
                        <span className={styles.count}>
                            {i18n.t('{{count}} of {{total}} sources enabled', {
                                count: enabledCount,
                                total: totalCount,
                            })}
                        </span>
                        <ButtonStrip end>
                            <Button
                                dataTest="managelayersourcesmodal-button"
                                secondary
                                onClick={onClose}
                            >
                                {i18n.t('Close')}
                            </Button>
                        </ButtonStrip>
                    </div>
                )}
            </ModalActions>
        </Modal>
    )
}

ManageLayerSourcesModal.propTypes = {
    onClose: PropTypes.func.isRequired,
}

export default ManageLayerSourcesModal
```

-   [ ] **Step 2: Append the two new rules to the modal stylesheet**

Append to `src/components/layerSources/styles/ManageLayerSourcesModal.module.css`:

```css
.back {
    margin-block-end: var(--spacers-dp12);
}

.notice {
    display: flex;
    align-items: center;
    gap: var(--spacers-dp8);
    margin-block-end: var(--spacers-dp12);
    padding: var(--spacers-dp8) var(--spacers-dp12);
    border-radius: 4px;
    background-color: var(--colors-teal050);
    color: var(--colors-grey800);
    font-size: 13px;
}
```

-   [ ] **Step 3: Lint**

Run:

```bash
npx prettier --write src/components/layerSources && npx eslint src/components/layerSources --ext .js,.jsx
```

Expected: eslint exits 0. `Tooltip` must no longer be imported - if eslint reports it unused, the import block was not replaced correctly.

-   [ ] **Step 4: Commit**

```bash
git add src/components/layerSources/ManageLayerSourcesModal.jsx src/components/layerSources/styles/ManageLayerSourcesModal.module.css
git commit -m "feat: add source view in layer sources modal (prototype)"
```

---

## Task 3: "Added in this session" pill

**Files:**

-   Modify: `src/components/layerSources/LayerSource.jsx`
-   Modify: `src/components/layerSources/styles/LayerSource.module.css`

`LayerSource.jsx` currently has no i18n import - add one. `propTypes` in this repo list required props alphabetically first, then optional ones, so `isNew` goes after `onToggle`.

-   [ ] **Step 1: Add the `isNew` prop**

In `src/components/layerSources/LayerSource.jsx`, add the i18n import above the `prop-types` import:

```jsx
import i18n from '@dhis2/d2-i18n'
```

Change the signature from:

```jsx
const LayerSource = ({ layerSource, isAdded, onToggle }) => {
```

to:

```jsx
const LayerSource = ({ layerSource, isAdded, onToggle, isNew }) => {
```

Change the name element from:

```jsx
<div className={styles.name}>{label}</div>
```

to:

```jsx
<div className={styles.name}>
    {label}
    {isNew && (
        <span className={styles.newPill}>
            {i18n.t('Added in this session')}
        </span>
    )}
</div>
```

And extend `propTypes` from:

```jsx
LayerSource.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layerSource: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
}
```

to:

```jsx
LayerSource.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layerSource: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    isNew: PropTypes.bool,
}
```

-   [ ] **Step 2: Add the pill style**

Append to `src/components/layerSources/styles/LayerSource.module.css`:

```css
.newPill {
    display: inline-block;
    margin-inline-start: var(--spacers-dp8);
    padding: 1px 6px;
    border-radius: 8px;
    background-color: var(--colors-teal050);
    color: var(--colors-teal700);
    font-size: 11px;
    font-weight: 400;
    vertical-align: middle;
}
```

-   [ ] **Step 3: Lint**

Run:

```bash
npx prettier --write src/components/layerSources && npx eslint src/components/layerSources --ext .js,.jsx
```

Expected: exits 0.

-   [ ] **Step 4: Commit**

```bash
git add src/components/layerSources/LayerSource.jsx src/components/layerSources/styles/LayerSource.module.css
git commit -m "feat: mark newly added layer sources in the list (prototype)"
```

---

## Task 4: Manual verification pass

**Files:** none

The app needs a DHIS2 backend. Start it with the same instance you have been using for the prototype:

```bash
yarn start
```

-   [ ] **Step 1: Walk the flow**

Open http://localhost:3000, click `Add layer` in the left panel, and click `Manage layer sources`. Work through this list and note anything that does not match:

-   [ ] `Add source` in the list header is enabled (no "Coming soon" tooltip) and opens the form.
-   [ ] The modal title reads "Add layer source"; the footer shows `Cancel` and a disabled `Add source`.
-   [ ] `Back to all sources` returns to the list. So does `Cancel`. So does Escape (and Escape does **not** close the whole modal from the form).
-   [ ] Tabbing through Name and URL without typing shows "A name is required" / "A URL is required"; typing `not-a-url` in URL shows "Enter a full URL, including https://".
-   [ ] Choosing `WMS` reveals `Layers` (required) and `Image format`. Choosing `XYZ` hides `Layers` but keeps `Image format`. Choosing `Vector style` or `GeoJSON URL` hides both.
-   [ ] The URL placeholder and help text change with the map service.
-   [ ] The `Legend set` dropdown lists the instance's legend sets and can be cleared.
-   [ ] Add an XYZ source (Name `Test XYZ`, URL `https://example.org/tiles/{z}/{x}/{y}.png`): the modal returns to the list, shows the info notice, and the row appears under **External data**, checked, with the "Added in this session" pill and `Service: XYZ tiles` / `Host: example.org` meta.
-   [ ] Add a WMS source with `Layers` filled: same, with `Service: WMS`.
-   [ ] Unchecking then rechecking a newly added row works like any other row, and the footer's "N of M sources enabled" count includes it.
-   [ ] Set `Layer position` to `Basemap` and add: no new row, and the notice explains that basemaps are not listed here.
-   [ ] The search box and the Status/Type filters still work with added sources present.

-   [ ] **Step 2: Report**

Report which checks passed and which did not. Do not fix unrelated pre-existing issues; note them instead.

---

## Task 5: Final lint and i18n

**Files:** possibly `i18n/en.pot`

-   [ ] **Step 1: Full lint**

Run:

```bash
yarn lint
```

Expected: exits 0. If it reports problems in files this plan did not touch, leave them alone and say so.

-   [ ] **Step 2: Regenerate translation strings (optional)**

The prototype branch has been committing `i18n/en.pot` updates. If you want to keep that consistent:

```bash
yarn build
```

Then commit the pot change only if it is non-empty:

```bash
git add i18n/en.pot && git commit -m "chore: update i18n strings"
```

If `yarn build` fails for reasons unrelated to this change, skip this step - the pot file is not needed to demo the prototype.

---

## Notes for the implementer

-   Everything here is throwaway. Keep the `PROTOTYPE ONLY` comments; they are how the branch tracks what must be deleted before any of this becomes real.
-   Do not add a `POST` to `externalMapLayers`, a URL reachability check, a WMS `GetCapabilities` probe, or a layer picker. All were considered and cut deliberately: nothing in the API supports them today, and the point of this mock is to show only what the backend already offers.
