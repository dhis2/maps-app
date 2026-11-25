import { USER_ORG_UNIT } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateLayer } from '../../actions/layers.js'
import { closeOsmEdit, openOsmFeatureForm } from '../../actions/osmEdit.js'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_OPTIONS_DYNAMIC,
} from '../../constants/alerts.js'
import {
    editFeature,
    eventToFeature,
    getGeometryParts,
    getReshapeChanges,
    toTrackerEvent,
} from '../../util/osm.js'
import { getOsmCategory, OSM_GEOMETRY_LINE } from '../../util/osmCategories.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { getRefreshedOsmLayers } from './osmLayer.js'
import {
    findOrgUnitForPoint,
    loadOrgUnits,
    splitDrawnLine,
} from './osmOrgUnits.js'
import {
    deleteOsmEvents,
    ensureProgramOrgUnits,
    fetchFeaturePieces,
    fetchOsmEvent,
    getOsmErrorMessage,
    importOsmEvents,
} from './osmRequests.js'

// Starts drawing on the map, from the context menu (new road) or the
// feature profile (edit the shape of a stored feature)
const OsmDrawing = ({ map }) => {
    const drawing = useSelector((state) => state.osmEdit.drawing)
    const mapViews = useSelector((state) => state.map.mapViews)
    const dispatch = useDispatch()
    const engine = useDataEngine()
    const { currentUser } = useCachedData()
    const alert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_OPTIONS_DYNAMIC)

    useEffect(() => {
        if (!map || !drawing) {
            return
        }

        const { categoryId, eventId, start, geometry } = drawing
        const category = categoryId && getOsmCategory(categoryId)

        const rootIds = currentUser.userOrgUnitIdsByKeyword[USER_ORG_UNIT]
        const { username } = currentUser

        // A moved point gets the org unit of its new place, searched from
        // its stored org unit and that one's ancestors
        const getPointChanges = async (event, newGeometry) => {
            const feature = eventToFeature(event)
            const stored = (await loadOrgUnits(engine, [event.orgUnit])).get(
                event.orgUnit
            )
            const result = await findOrgUnitForPoint(
                engine,
                getGeometryParts(newGeometry).point,
                {
                    hintIds: stored?.path.split('/').filter(Boolean).reverse(),
                    rootIds,
                }
            )
            const edited = editFeature(feature, {
                geometry: newGeometry,
                username,
            })
            return {
                writes: [
                    toTrackerEvent(
                        edited,
                        category,
                        result?.orgUnit.id ?? event.orgUnit
                    ),
                ],
                deletes: [],
            }
        }

        // A reshaped road piece is split again and merged into the road's
        // other pieces per org unit
        const getLineChanges = async (event, newGeometry) => {
            const edited = eventToFeature(event)
            const pieces = await fetchFeaturePieces(
                engine,
                category.program.id,
                edited
            )
            const parts = await splitDrawnLine(engine, newGeometry, {
                rootIds,
            })
            return getReshapeChanges({
                edited,
                siblings: pieces.filter((piece) => piece.event !== eventId),
                parts: parts.map(({ orgUnit, geometry }) => ({
                    orgUnitId: orgUnit?.id ?? event.orgUnit,
                    geometry,
                })),
                category,
                username,
            })
        }

        const saveShape = async (newGeometry) => {
            const event = await fetchOsmEvent(engine, eventId)
            const { writes, deletes } =
                category.geometry === OSM_GEOMETRY_LINE
                    ? await getLineChanges(event, newGeometry)
                    : await getPointChanges(event, newGeometry)

            await ensureProgramOrgUnits(
                engine,
                category.program.id,
                writes.map((e) => e.orgUnit)
            )
            await importOsmEvents(engine, writes)
            await deleteOsmEvents(engine, deletes)

            const layers = await getRefreshedOsmLayers(
                engine,
                mapViews,
                category.program.id
            )
            layers.forEach((layer) => dispatch(updateLayer(layer)))
            alert.show({ msg: i18n.t('Shape saved') })
        }

        // New lines come without a category, it's picked in the form
        map.startDrawing({
            type:
                !category || category.geometry === OSM_GEOMETRY_LINE
                    ? 'line'
                    : 'point',
            start,
            geometry,
            onFinish: (newGeometry) => {
                if (eventId) {
                    dispatch(closeOsmEdit())
                    saveShape(newGeometry).catch((e) =>
                        alert.show({
                            msg: getOsmErrorMessage(e),
                            isError: true,
                        })
                    )
                } else {
                    dispatch(openOsmFeatureForm(categoryId, newGeometry))
                }
            },
            onCancel: () => dispatch(closeOsmEdit()),
        })

        return () => map.stopDrawing()
        // Only a new drawing request restarts drawing
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, drawing])

    return null
}

OsmDrawing.propTypes = {
    map: PropTypes.object,
}

export default OsmDrawing
