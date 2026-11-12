import { USER_ORG_UNIT } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addLayer } from '../../actions/layers.js'
import {
    isPolygon,
    removeNestedOrgUnits,
} from '../../util/orgUnitAssignment.js'
import {
    buildImportPlan,
    buildOverpassCountQuery,
    buildOverpassQuery,
    clipToAreas,
    fetchOsmElements,
    getBbox,
    getDataValue,
    getSubcategoryCounts,
    isEventInSubcategories,
    parseOsmElements,
} from '../../util/osm.js'
import {
    getOsmCategories,
    getSubcategoryIds,
    OSM_GEOMETRY_LINE,
} from '../../util/osmCategories.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import {
    DoneStep,
    PreviewStep,
    SelectStep,
    SetupStep,
} from './OsmImportSteps.jsx'
import { getOrgUnitsLabel, getOsmLayer } from './osmLayer.js'
import { OSM_DATA_ELEMENTS as DE } from './osmMetadata.js'
import {
    assignImportLines,
    assignImportPoints,
    getLoadedOrgUnitName,
    loadOrgUnits,
} from './osmOrgUnits.js'
import {
    canCreateOsmSetup,
    createOsmMetadata,
    deleteOsmEvents,
    ensureProgramOrgUnits,
    fetchOsmEvents,
    fetchOsmEventsByValue,
    getOsmErrorMessage,
    importOsmEvents,
    isOsmSetupMissing,
} from './osmRequests.js'
import styles from './styles/OsmImport.module.css'

const STEP_LOADING = 'loading'
const STEP_SETUP = 'setup'
const STEP_SELECT = 'select'
const STEP_PREVIEW = 'preview'
const STEP_DONE = 'done'

const getDeletes = (plan, deleteRemoved) => [
    ...plan.deletes,
    ...(deleteRemoved ? plan.removedDeletes : []),
]

const byOsmId = (events) =>
    new Map(events.map((event) => [getDataValue(event, DE.id), event]))

const OsmImportModal = ({ onClose }) => {
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const { currentUser } = useCachedData()
    const categories = useMemo(() => getOsmCategories(), [])

    const [step, setStep] = useState(STEP_SELECT)
    const [error, setError] = useState()
    const [category, setCategory] = useState()
    const [subcategoryIds, setSubcategoryIds] = useState([])
    // Import areas: [{ id, path, name }]
    const [orgUnits, setOrgUnits] = useState([])
    const [counts, setCounts] = useState()
    const [isCounting, setIsCounting] = useState(false)
    const [plan, setPlan] = useState()
    const [deleteRemoved, setDeleteRemoved] = useState(true)
    const [stats, setStats] = useState()
    const rootIds = currentUser.userOrgUnitIdsByKeyword[USER_ORG_UNIT]

    const canSetup = canCreateOsmSetup(currentUser.authorities)

    // Runs an async step, going back to fallbackStep on error
    const run = useCallback(async (fn, fallbackStep) => {
        setError(null)
        setStep(STEP_LOADING)
        try {
            await fn()
        } catch (e) {
            setError(getOsmErrorMessage(e))
            fallbackStep && setStep(fallbackStep)
        }
    }, [])

    // All subcategories selected by default
    const onCategoryChange = (id) => {
        const selected = categories.find((c) => c.id === id)
        setCategory(selected)
        setSubcategoryIds(getSubcategoryIds(selected))
        setCounts(null)
    }

    const onOrgUnitChange = ({ id, path, displayName, checked }) => {
        setOrgUnits((selected) =>
            checked
                ? [...selected, { id, path, name: displayName }]
                : selected.filter((orgUnit) => orgUnit.id !== id)
        )
        setCounts(null)
    }

    // An org unit inside another selected one comes with it
    const loadAreas = async () => {
        const selected = removeNestedOrgUnits(orgUnits)
        const loaded = await loadOrgUnits(
            engine,
            selected.map(({ id }) => id)
        )
        const areas = selected.map(({ id }) => loaded.get(id))
        const withoutBoundary = selected.filter(
            (orgUnit, i) => !isPolygon(areas[i]?.geometry)
        )
        if (withoutBoundary.length) {
            throw new Error(
                i18n.t('These org units have no boundary: {{- names}}', {
                    names: withoutBoundary.map(({ name }) => name).join(', '),
                    nsSeparator: ';',
                })
            )
        }
        return areas
    }

    const getBboxes = (areas) => areas.map(({ geometry }) => getBbox(geometry))

    // Counts in the bboxes of the areas, so a bit more than will be imported
    const onCount = async () => {
        setIsCounting(true)
        setError(null)
        try {
            const areas = await loadAreas()
            const ids = getSubcategoryIds(category)
            const elements = await fetchOsmElements(
                buildOverpassCountQuery(category, getBboxes(areas), ids)
            )
            setCounts(getSubcategoryCounts(elements, ids))
        } catch (e) {
            setError(getOsmErrorMessage(e))
        } finally {
            setIsCounting(false)
        }
    }

    // Points are matched to stored events in the areas, or anywhere by OSM id
    // when moved elsewhere. Ways only to their pieces in the areas: pieces in
    // other areas are updated by those areas' imports.
    const assignPointFeatures = async (features, areas, stored) => {
        const inArea = byOsmId(stored)
        const missingIds = features
            .map(({ osmId }) => osmId)
            .filter((osmId) => !inArea.has(osmId))
        const elsewhere = missingIds.length
            ? await fetchOsmEventsByValue(engine, {
                  programId: category.program.id,
                  dataElement: DE.id,
                  values: missingIds,
              })
            : []
        const others = byOsmId(elsewhere)

        const assigned = await assignImportPoints(
            engine,
            features.map(({ osmId, point, areaId }) => ({
                key: osmId,
                point,
                areaId,
                storedOrgUnitId: (inArea.get(osmId) ?? others.get(osmId))
                    ?.orgUnit,
            })),
            { areas, rootIds }
        )
        return {
            points: features.map((f) => ({ ...f, ...assigned.get(f.osmId) })),
            elsewhere,
        }
    }

    const assignWayFeatures = async (features, areas) => {
        const pieces = await assignImportLines(
            engine,
            features.flatMap(({ osmId, clips }) =>
                clips.map(({ areaId, line }) => ({
                    key: osmId,
                    geometry: line,
                    areaId,
                }))
            ),
            { areas }
        )
        return {
            ways: features.map((f) => ({
                ...f,
                pieces: pieces.get(f.osmId) ?? [],
            })),
        }
    }

    const preview = async () => {
        if (await isOsmSetupMissing(engine, category)) {
            setStep(STEP_SETUP)
            return
        }
        const areas = await loadAreas()
        const query = buildOverpassQuery(
            category,
            getBboxes(areas),
            subcategoryIds
        )
        const [elements, ...storedPerArea] = await Promise.all([
            fetchOsmElements(query),
            ...areas.map((area) =>
                fetchOsmEvents(engine, {
                    programId: category.program.id,
                    orgUnitId: area.id,
                })
            ),
        ])
        const stored = storedPerArea.flat()
        const features = clipToAreas(
            parseOsmElements(elements, category, subcategoryIds),
            areas
        )
        const assigned =
            category.geometry === OSM_GEOMETRY_LINE
                ? await assignWayFeatures(features, areas)
                : await assignPointFeatures(features, areas, stored)

        // Names for the preview, mostly loaded by the assignment already
        await loadOrgUnits(engine, [
            ...new Set(stored.map((event) => event.orgUnit)),
        ])

        setPlan(
            buildImportPlan({
                category,
                stored,
                isSelected: (event) =>
                    isEventInSubcategories(event, category, subcategoryIds),
                getOrgUnitName: getLoadedOrgUnitName,
                ...assigned,
            })
        )
        setDeleteRemoved(true)
        setStep(STEP_PREVIEW)
    }

    const onPreview = () => run(preview, STEP_SELECT)

    // Creates or updates the category's program, then goes on to the preview
    const onSetup = () =>
        run(async () => {
            await createOsmMetadata(engine, category)
            await preview()
        }, STEP_SETUP)

    const onImport = () =>
        run(async () => {
            await ensureProgramOrgUnits(
                engine,
                category.program.id,
                plan.writes.map((event) => event.orgUnit)
            )
            const written = await importOsmEvents(engine, plan.writes)
            const { deleted } = await deleteOsmEvents(
                engine,
                getDeletes(plan, deleteRemoved)
            )
            setStats({ ...written, deleted })
            setStep(STEP_DONE)
        }, STEP_PREVIEW)

    // Reads the events from DHIS2, for the org unit and its descendants, so
    // it also works for data imported earlier
    const onShowOnMap = (fallbackStep) =>
        run(async () => {
            const layer = await getOsmLayer(
                engine,
                category,
                removeNestedOrgUnits(orgUnits)
            )
            if (!layer) {
                throw new Error(
                    i18n.t(
                        'No {{- category}} imported for {{- orgUnit}} yet.',
                        {
                            category: category.name,
                            orgUnit: getOrgUnitsLabel(orgUnits),
                        }
                    )
                )
            }
            dispatch(addLayer(layer))
            onClose()
        }, fallbackStep)

    return (
        <Modal large position="middle" onClose={onClose}>
            <ModalTitle>{i18n.t('Import from OpenStreetMap')}</ModalTitle>
            <ModalContent className={styles.content}>
                {error && (
                    <NoticeBox error className={styles.error}>
                        {error}
                    </NoticeBox>
                )}
                {step === STEP_LOADING && !error && (
                    <div className={styles.loading}>
                        <CircularLoader />
                    </div>
                )}
                {step === STEP_SETUP && (
                    <SetupStep category={category} canSetup={canSetup} />
                )}
                {step === STEP_SELECT && (
                    <SelectStep
                        categories={categories}
                        category={category}
                        subcategoryIds={subcategoryIds}
                        counts={counts}
                        isCounting={isCounting}
                        orgUnits={orgUnits}
                        roots={rootIds}
                        onCategoryChange={onCategoryChange}
                        onSubcategoriesChange={setSubcategoryIds}
                        onCount={onCount}
                        onOrgUnitChange={onOrgUnitChange}
                    />
                )}
                {step === STEP_PREVIEW && (
                    <PreviewStep
                        category={category}
                        orgUnits={orgUnits}
                        plan={plan}
                        deleteRemoved={deleteRemoved}
                        onDeleteRemovedChange={setDeleteRemoved}
                    />
                )}
                {step === STEP_DONE && <DoneStep stats={stats} />}
                <div className={styles.attribution}>
                    {i18n.t('Data © OpenStreetMap contributors, ODbL.')}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {step === STEP_DONE
                            ? i18n.t('Close')
                            : i18n.t('Cancel')}
                    </Button>
                    {step === STEP_SETUP && (
                        <>
                            <Button onClick={() => setStep(STEP_SELECT)}>
                                {i18n.t('Back')}
                            </Button>
                            <Button
                                primary
                                disabled={!canSetup}
                                onClick={onSetup}
                            >
                                {i18n.t('Set up and fetch')}
                            </Button>
                        </>
                    )}
                    {step === STEP_SELECT && (
                        <>
                            <Button
                                disabled={!category || !orgUnits.length}
                                onClick={() => onShowOnMap(STEP_SELECT)}
                            >
                                {i18n.t('Show imported data on map')}
                            </Button>
                            <Button
                                primary
                                disabled={
                                    !category ||
                                    !orgUnits.length ||
                                    !subcategoryIds.length
                                }
                                onClick={onPreview}
                            >
                                {i18n.t('Fetch from OSM')}
                            </Button>
                        </>
                    )}
                    {step === STEP_PREVIEW && (
                        <>
                            <Button onClick={() => setStep(STEP_SELECT)}>
                                {i18n.t('Back')}
                            </Button>
                            <Button
                                primary
                                disabled={
                                    !plan.writes.length &&
                                    !getDeletes(plan, deleteRemoved).length
                                }
                                onClick={onImport}
                            >
                                {i18n.t('Import')}
                            </Button>
                        </>
                    )}
                    {step === STEP_DONE && (
                        <Button primary onClick={() => onShowOnMap(STEP_DONE)}>
                            {i18n.t('Show on map')}
                        </Button>
                    )}
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

OsmImportModal.propTypes = {
    onClose: PropTypes.func.isRequired,
}

export default OsmImportModal
