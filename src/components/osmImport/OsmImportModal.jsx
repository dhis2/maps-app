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
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addLayer } from '../../actions/layers.js'
import { GEOJSON_URL_LAYER } from '../../constants/layers.js'
import { GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON } from '../../util/geojson.js'
import {
    buildOverpassQuery,
    compareWithEvents,
    eventsToFeatureCollection,
    fetchOsmElements,
    getBbox,
    OSM_STATUS_UNCHANGED,
    parseOsmElements,
    toTrackerEvent,
} from '../../util/osm.js'
import {
    getOsmCategories,
    OSM_GEOMETRY_LINE,
} from '../../util/osmCategories.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import {
    DoneStep,
    PreviewStep,
    SelectStep,
    SetupStep,
} from './OsmImportSteps.jsx'
import {
    assignOrgUnitToProgram,
    createOsmMetadata,
    fetchOrgUnitGeometry,
    fetchOsmEvents,
    fetchOsmPrograms,
    importOsmEvents,
} from './osmRequests.js'
import styles from './styles/OsmImport.module.css'

const STEP_LOADING = 'loading'
const STEP_SETUP = 'setup'
const STEP_SELECT = 'select'
const STEP_PREVIEW = 'preview'
const STEP_DONE = 'done'

const SETUP_AUTHORITIES = ['F_PROGRAM_PUBLIC_ADD', 'F_DATAELEMENT_PUBLIC_ADD']
const IMPORT_CHUNK_SIZE = 500

const LINE_STYLE = { strokeColor: '#d95f02', weight: 3 }
const POINT_STYLE = {
    color: '#1b9e77',
    strokeColor: '#ffffff',
    pointSize: 6,
    weight: 1,
}

const getErrorMessage = (error) =>
    error.details?.validationReport?.errorReports?.[0]?.message ?? error.message

const OsmImportModal = ({ onClose }) => {
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const { currentUser } = useCachedData()
    const categories = useMemo(() => getOsmCategories(), [])
    const programCodes = categories
        .filter(({ mocked }) => !mocked)
        .map(({ program }) => program.code)

    const [step, setStep] = useState(STEP_LOADING)
    const [error, setError] = useState()
    const [missingPrograms, setMissingPrograms] = useState([])
    const [category, setCategory] = useState()
    const [orgUnit, setOrgUnit] = useState()
    const [features, setFeatures] = useState([])
    const [stats, setStats] = useState()

    const canSetup =
        currentUser.authorities.has('ALL') ||
        SETUP_AUTHORITIES.every((auth) => currentUser.authorities.has(auth))

    // Runs an async step, going back to fallbackStep on error
    const run = useCallback(async (fn, fallbackStep) => {
        setError(null)
        setStep(STEP_LOADING)
        try {
            await fn()
        } catch (e) {
            setError(getErrorMessage(e))
            fallbackStep && setStep(fallbackStep)
        }
    }, [])

    const checkPrograms = useCallback(async () => {
        const programs = await fetchOsmPrograms(engine, programCodes)
        const found = programs.map(({ code }) => code)
        const missing = programCodes.filter((code) => !found.includes(code))
        setMissingPrograms(missing)
        setStep(missing.length ? STEP_SETUP : STEP_SELECT)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine])

    useEffect(() => {
        run(checkPrograms)
    }, [run, checkPrograms])

    const onSetup = () =>
        run(async () => {
            await createOsmMetadata(engine)
            await checkPrograms()
        }, STEP_SETUP)

    const onPreview = () =>
        run(async () => {
            const { geometry } = await fetchOrgUnitGeometry(engine, orgUnit.id)
            if (
                geometry?.type !== GEO_TYPE_POLYGON &&
                geometry?.type !== GEO_TYPE_MULTIPOLYGON
            ) {
                throw new Error(
                    i18n.t('The selected org unit has no boundary.')
                )
            }
            const query = buildOverpassQuery(category, getBbox(geometry))
            const [elements, events] = await Promise.all([
                fetchOsmElements(query),
                fetchOsmEvents(engine, {
                    programId: category.program.id,
                    orgUnitId: orgUnit.id,
                }),
            ])
            const osmFeatures = parseOsmElements(elements, category, geometry)
            setFeatures(compareWithEvents(osmFeatures, events))
            setStep(STEP_PREVIEW)
        }, STEP_SELECT)

    const onImport = () =>
        run(async () => {
            await assignOrgUnitToProgram(
                engine,
                category.program.id,
                orgUnit.id
            )
            const events = features
                .filter(({ status }) => status !== OSM_STATUS_UNCHANGED)
                .map((feature) => toTrackerEvent(feature, category, orgUnit.id))
            const total = { created: 0, updated: 0, ignored: 0 }

            for (let i = 0; i < events.length; i += IMPORT_CHUNK_SIZE) {
                const response = await importOsmEvents(
                    engine,
                    events.slice(i, i + IMPORT_CHUNK_SIZE)
                )
                Object.keys(total).forEach((key) => {
                    total[key] += response.stats?.[key] ?? 0
                })
            }

            setStats(total)
            setStep(STEP_DONE)
        }, STEP_PREVIEW)

    // Reads the events from DHIS2, for the org unit and its descendants, so
    // it also works for data imported earlier
    const onShowOnMap = (fallbackStep) =>
        run(async () => {
            const events = await fetchOsmEvents(engine, {
                programId: category.program.id,
                orgUnitId: orgUnit.id,
                orgUnitMode: 'DESCENDANTS',
            })
            if (!events.length) {
                throw new Error(
                    i18n.t(
                        'No {{- category}} imported for {{- orgUnit}} yet.',
                        {
                            category: category.name,
                            orgUnit: orgUnit.name,
                        }
                    )
                )
            }
            const geojson = eventsToFeatureCollection(events)
            const name = `OSM ${category.name}, ${orgUnit.name}`

            dispatch(
                addLayer({
                    layer: GEOJSON_URL_LAYER,
                    name,
                    config: {
                        name,
                        url: `data:application/geo+json,${encodeURIComponent(
                            JSON.stringify(geojson)
                        )}`,
                    },
                    featureStyle:
                        category.geometry === OSM_GEOMETRY_LINE
                            ? LINE_STYLE
                            : POINT_STYLE,
                })
            )
            onClose()
        }, fallbackStep)

    const onCategoryChange = (id) =>
        setCategory(categories.find((c) => c.id === id))

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
                    <SetupStep
                        missingPrograms={missingPrograms}
                        canSetup={canSetup}
                    />
                )}
                {step === STEP_SELECT && (
                    <SelectStep
                        categories={categories}
                        category={category}
                        orgUnit={orgUnit}
                        roots={
                            currentUser.userOrgUnitIdsByKeyword[USER_ORG_UNIT]
                        }
                        onCategoryChange={onCategoryChange}
                        onOrgUnitChange={setOrgUnit}
                    />
                )}
                {step === STEP_PREVIEW && (
                    <PreviewStep
                        category={category}
                        orgUnit={orgUnit}
                        features={features}
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
                        <Button primary disabled={!canSetup} onClick={onSetup}>
                            {i18n.t('Set up OSM import')}
                        </Button>
                    )}
                    {step === STEP_SELECT && (
                        <>
                            <Button
                                disabled={!category || !orgUnit}
                                onClick={() => onShowOnMap(STEP_SELECT)}
                            >
                                {i18n.t('Show imported data on map')}
                            </Button>
                            <Button
                                primary
                                disabled={!category || !orgUnit}
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
                                disabled={features.every(
                                    ({ status }) =>
                                        status === OSM_STATUS_UNCHANGED
                                )}
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
