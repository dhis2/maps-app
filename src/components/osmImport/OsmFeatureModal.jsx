import { USER_ORG_UNIT } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    OrganisationUnitTree,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeFeatureProfile } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import { closeOsmEdit } from '../../actions/osmEdit.js'
import {
    createManualFeature,
    editFeature,
    eventToFeature,
    getGeometryParts,
    toTrackerEvent,
} from '../../util/osm.js'
import {
    formatTag,
    getOsmCategories,
    getOsmCategory,
    getTagForValue,
    OSM_GEOMETRY_LINE,
} from '../../util/osmCategories.js'
import { generateUid } from '../../util/uid.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { getRefreshedOsmLayers } from './osmLayer.js'
import { findOrgUnitForPoint, splitDrawnLine } from './osmOrgUnits.js'
import {
    canCreateOsmSetup,
    createOsmMetadata,
    ensureProgramOrgUnits,
    fetchFeaturePieces,
    fetchOsmEvent,
    getOsmErrorMessage,
    importOsmEvents,
    isOsmSetupMissing,
} from './osmRequests.js'
import styles from './styles/OsmImport.module.css'

const getOptionLabel = (option) => option

// Keeps an imported value selectable when it isn't in the default options
const getOptions = (options, value) =>
    value && !options.includes(value) ? [value, ...options] : options

const OptionsField = ({
    label,
    options,
    selected,
    clearable,
    getLabel = getOptionLabel,
    onChange,
}) => (
    <SingleSelectField
        label={label}
        selected={selected}
        clearable={clearable}
        onChange={({ selected }) => onChange(selected)}
    >
        {getOptions(options, selected).map((option) => (
            <SingleSelectOption
                key={option}
                value={option}
                label={getLabel(option)}
            />
        ))}
    </SingleSelectField>
)

OptionsField.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    clearable: PropTypes.bool,
    getLabel: PropTypes.func,
    selected: PropTypes.string,
}

const getTitle = ({ isEdit, isLine, name }) => {
    if (isEdit) {
        return i18n.t('Edit {{- name}}', { name })
    }
    return isLine ? i18n.t('Add a line') : i18n.t('Add a feature')
}

const getSavedNote = (feature) =>
    feature?.osmId
        ? i18n.t(
              'Saved in DHIS2 only, with you as the editor. Later imports keep your edit and show OSM changes as conflicts.'
          )
        : i18n.t(
              'Saved in DHIS2 only, with you as the editor. Nothing is sent to OpenStreetMap.'
          )

// The stored feature, and all its events: a road has one per org unit
const loadStoredFeature = async (engine, { eventId, programId, isLine }) => {
    const event = await fetchOsmEvent(engine, eventId)
    const feature = eventToFeature(event)
    const pieces = isLine
        ? await fetchFeaturePieces(engine, programId, feature)
        : [event]
    return { feature, pieces }
}

// The org units of a new feature: [{ orgUnit, geometry }], orgUnit null
// outside every known boundary
const findNewFeaturePieces = async (engine, { geometry, isLine, rootIds }) => {
    if (isLine) {
        return splitDrawnLine(engine, geometry, { rootIds })
    }
    const { point } = getGeometryParts(geometry)
    const result = await findOrgUnitForPoint(engine, point, { rootIds })
    return [{ orgUnit: result?.orgUnit ?? null, geometry }]
}

const getFeatureEvents = ({
    isEdit,
    pieces,
    category,
    values,
    geometry,
    pickedOrgUnit,
}) => {
    if (isEdit) {
        return pieces.map((event) =>
            toTrackerEvent(
                editFeature(eventToFeature(event), values),
                category,
                event.orgUnit
            )
        )
    }

    // One feature key for all pieces of the new feature
    const feature = createManualFeature({ ...values, geometry })
    return pieces.map((piece) =>
        toTrackerEvent(
            {
                ...feature,
                ...getGeometryParts(piece.geometry),
                eventId: generateUid(),
            },
            category,
            (piece.orgUnit ?? pickedOrgUnit).id
        )
    )
}

const SetupNotice = ({ category, canSetup }) => {
    const values = { category: category.name.toLowerCase() }

    return canSetup ? (
        <div className={styles.note}>
            {i18n.t(
                'The program for {{- category}} will be created when saving.',
                values
            )}
        </div>
    ) : (
        <NoticeBox warning>
            {i18n.t(
                'The program for {{- category}} is not set up. Ask a system administrator to set it up.',
                values
            )}
        </NoticeBox>
    )
}

SetupNotice.propTypes = {
    canSetup: PropTypes.bool.isRequired,
    category: PropTypes.object.isRequired,
}

// Where a new feature goes, and a picker for its parts outside every known
// boundary
const OrgUnitSection = ({ pieces, pickedOrgUnit, roots, onPick }) => {
    const found = pieces.map(({ orgUnit }) => orgUnit?.name).filter(Boolean)
    const needsOrgUnit = pieces.some(({ orgUnit }) => !orgUnit)

    return (
        <>
            {found.length > 0 && (
                <div>
                    {i18n.t('Org unit: {{- names}}', {
                        names: found.join(', '),
                        nsSeparator: ';',
                    })}
                </div>
            )}
            {needsOrgUnit && (
                <div>
                    <div className={styles.heading}>
                        {found.length
                            ? i18n.t(
                                  'Org unit for the parts outside known boundaries'
                              )
                            : i18n.t('Org unit')}
                    </div>
                    <div className={styles.tree}>
                        <OrganisationUnitTree
                            roots={roots}
                            singleSelection
                            selected={pickedOrgUnit ? [pickedOrgUnit.path] : []}
                            onChange={({ id, path, displayName, selected }) =>
                                onPick(
                                    selected.length
                                        ? { id, path, name: displayName }
                                        : null
                                )
                            }
                        />
                    </div>
                </div>
            )}
        </>
    )
}

OrgUnitSection.propTypes = {
    pieces: PropTypes.array.isRequired,
    roots: PropTypes.array.isRequired,
    onPick: PropTypes.func.isRequired,
    pickedOrgUnit: PropTypes.object,
}

// Adds a feature missing in OSM, or edits a stored one. Saved in the
// program only, never sent to OSM. A road is saved as one event per org unit
// it crosses, and edits apply to all of them.
const OsmFeatureModal = () => {
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const { currentUser } = useCachedData()
    const { categoryId, geometry, eventId } = useSelector(
        (state) => state.osmEdit.form
    )
    const mapViews = useSelector((state) => state.map.mapViews)
    const isEdit = !!eventId
    const rootIds = currentUser.userOrgUnitIdsByKeyword[USER_ORG_UNIT]
    const canSetup = canCreateOsmSetup(currentUser.authorities)

    // A new feature from the map can go in any category of its geometry
    const isLine = isEdit
        ? getOsmCategory(categoryId).geometry === OSM_GEOMETRY_LINE
        : geometry.type !== 'Point'
    const categories = useMemo(
        () =>
            getOsmCategories().filter(
                (c) => (c.geometry === OSM_GEOMETRY_LINE) === isLine
            ),
        [isLine]
    )
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        categoryId ?? categories[0].id
    )
    // Stable, as it's an effect dependency
    const category = useMemo(
        () => getOsmCategory(selectedCategoryId),
        [selectedCategoryId]
    )

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState()
    const [isSetUp, setIsSetUp] = useState(true)
    const [storedFeature, setStoredFeature] = useState()
    // Edit: the stored events of the feature. Add: [{ orgUnit, geometry }]
    const [pieces, setPieces] = useState([])
    // For the parts of a new feature outside every known boundary
    const [pickedOrgUnit, setPickedOrgUnit] = useState()
    const [name, setName] = useState('')
    const [type, setType] = useState(category.typeOptions[0])
    const [surface, setSurface] = useState()

    const needsOrgUnit = !isEdit && pieces.some(({ orgUnit }) => !orgUnit)

    const onClose = () => dispatch(closeOsmEdit())

    const onCategoryChange = (id) => {
        setSelectedCategoryId(id)
        setType(getOsmCategory(id).typeOptions[0])
        setSurface(undefined)
    }

    // The feature, or the org units of a new one, independent of the category
    useEffect(() => {
        const load = async () => {
            if (!isEdit) {
                setPieces(
                    await findNewFeaturePieces(engine, {
                        geometry,
                        isLine,
                        rootIds,
                    })
                )
                return
            }
            const { feature, pieces } = await loadStoredFeature(engine, {
                eventId,
                programId: getOsmCategory(categoryId).program.id,
                isLine,
            })
            setStoredFeature(feature)
            setPieces(pieces)
            setName(feature.name)
            setType(feature.type)
            setSurface(feature.surface)
        }

        load()
            .catch((e) => setError(e.message))
            .finally(() => setIsLoading(false))
        // rootIds is stable for the session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, categoryId, eventId, isEdit, isLine, geometry])

    // A category used for the first time needs its program
    useEffect(() => {
        isOsmSetupMissing(engine, category)
            .then((isMissing) => setIsSetUp(!isMissing))
            .catch((e) => setError(e.message))
    }, [engine, category])

    const onSave = async () => {
        setIsSaving(true)
        setError(null)
        try {
            if (!isSetUp) {
                await createOsmMetadata(engine, category)
            }
            const tag = getTagForValue(category, type)
            const events = getFeatureEvents({
                isEdit,
                pieces,
                category,
                geometry,
                pickedOrgUnit,
                values: {
                    name,
                    type,
                    surface,
                    tag: tag && formatTag(tag),
                    subcategory: tag?.subcategory,
                    username: currentUser.username,
                },
            })
            await ensureProgramOrgUnits(
                engine,
                category.program.id,
                events.map((event) => event.orgUnit)
            )
            await importOsmEvents(engine, events)
            const layers = await getRefreshedOsmLayers(
                engine,
                mapViews,
                category.program.id
            )
            layers.forEach((layer) => dispatch(updateLayer(layer)))
            if (isEdit) {
                dispatch(closeFeatureProfile())
            }
            onClose()
        } catch (e) {
            setError(getOsmErrorMessage(e))
            setIsSaving(false)
        }
    }

    const isSaveDisabled =
        (!isSetUp && !canSetup) ||
        isLoading ||
        !name.trim() ||
        (needsOrgUnit && !pickedOrgUnit)

    return (
        <Modal position="middle" onClose={onClose}>
            <ModalTitle>
                {getTitle({
                    isEdit,
                    isLine,
                    name: storedFeature?.name ?? '',
                })}
            </ModalTitle>
            <ModalContent className={styles.content}>
                {error && (
                    <NoticeBox error className={styles.error}>
                        {error}
                    </NoticeBox>
                )}
                {isLoading ? (
                    <div className={styles.loading}>
                        <CircularLoader />
                    </div>
                ) : (
                    <div className={styles.form}>
                        {!isEdit && (
                            <OptionsField
                                label={i18n.t('Category')}
                                options={categories.map(({ id }) => id)}
                                getLabel={(id) =>
                                    categories.find((c) => c.id === id).name
                                }
                                selected={selectedCategoryId}
                                onChange={onCategoryChange}
                            />
                        )}
                        {!isSetUp && (
                            <SetupNotice
                                category={category}
                                canSetup={canSetup}
                            />
                        )}
                        <p className={styles.note}>
                            {getSavedNote(storedFeature)}
                        </p>
                        <InputField
                            label={i18n.t('Name')}
                            value={name}
                            onChange={({ value }) => setName(value)}
                        />
                        <OptionsField
                            label={i18n.t('Type')}
                            options={category.typeOptions}
                            selected={type}
                            onChange={setType}
                        />
                        {category.surfaceOptions && (
                            <OptionsField
                                label={i18n.t('Surface')}
                                options={category.surfaceOptions}
                                selected={surface}
                                clearable
                                onChange={setSurface}
                            />
                        )}
                        {isEdit && pieces.length > 1 && (
                            <div className={styles.note}>
                                {i18n.t(
                                    'This road is saved in {{count}} org units, the changes apply to all of them.',
                                    { count: pieces.length }
                                )}
                            </div>
                        )}
                        {!isEdit && (
                            <OrgUnitSection
                                pieces={pieces}
                                pickedOrgUnit={pickedOrgUnit}
                                roots={rootIds}
                                onPick={setPickedOrgUnit}
                            />
                        )}
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        loading={isSaving}
                        disabled={isSaveDisabled}
                        onClick={onSave}
                    >
                        {i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export default OsmFeatureModal
