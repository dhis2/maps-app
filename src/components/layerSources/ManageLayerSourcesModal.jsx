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
import React, { useState } from 'react'
import getEarthEngineLayers from '../../constants/earthEngineLayers/index.js'
import { MAP_LAYER_POSITION_BASEMAP } from '../../constants/layers.js'
import {
    mockLayerSources,
    mockBasemapSources,
} from '../../constants/mockLayerSources.js'
import useAddedLayerSources from '../../hooks/useAddedLayerSources.js'
import useLayerCatalogPrefs from '../../hooks/useLayerCatalogPrefs.js'
import useManagedLayerSourcesStore from '../../hooks/useManagedLayerSourcesStore.js'
import {
    createExternalBasemapLayer,
    createExternalOverlayLayer,
} from '../../util/external.js'
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

const VIEW_LIST = 'list'
const VIEW_ADD = 'add'

const ManageLayerSourcesModal = ({ onClose }) => {
    const { managedLayerSources, showLayerSource, hideLayerSource } =
        useManagedLayerSourcesStore()
    const { addedSources, addSource } = useAddedLayerSources()
    const { isDisabled, toggleDisabled } = useLayerCatalogPrefs()
    const { defaultLayerSources, basemaps } = useCachedData()
    const [filter, setFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState(ALL)
    const [kindFilter, setKindFilter] = useState(ALL)
    const [placementFilter, setPlacementFilter] = useState(ALL)
    const [view, setView] = useState(VIEW_LIST)
    const [form, setForm] = useState(EMPTY_FORM)
    const [notice, setNotice] = useState(null)

    const isAddView = view === VIEW_ADD

    const closeAddView = () => {
        setView(VIEW_LIST)
        setForm(EMPTY_FORM)
    }

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

    // The map needs somewhere to render - never let the admin switch the last
    // basemap off. Counts sources added through the form too, not just the
    // ones that came from useCachedData().
    const enabledBasemapCount = allSources.filter(
        (source) =>
            getLayerSourcePlacement(source) === PLACEMENT_BASEMAP &&
            isEnabled(
                getLayerSourceKind(source),
                getManagedLayerSourceId(source)
            )
    ).length

    const lockedReason = i18n.t('At least one basemap must stay enabled')

    const listContent = (
        <>
            <div className={styles.description}>
                {i18n.t(
                    'Choose which layer sources are available to add to maps. This selection applies to all users.'
                )}
            </div>
            {notice && (
                <div className={styles.notice} role="status">
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
                <div className={styles.select}>
                    <SingleSelect
                        dense
                        prefix={i18n.t('Placement')}
                        selected={placementFilter}
                        onChange={({ selected }) =>
                            setPlacementFilter(selected)
                        }
                        dataTest="managelayersources-placement"
                    >
                        {PLACEMENT_OPTIONS.map(({ value, label }) => (
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
        // @dhis2/ui's Modal closes itself on Escape via a document listener, so
        // backing out of the form has to go through its own onClose
        <Modal
            onClose={isAddView ? closeAddView : onClose}
            large
            dataTest="managelayersourcesmodal"
        >
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
