import i18n from '@dhis2/d2-i18n'
import { GEOJSON_URL_LAYER } from '../../constants/layers.js'
import { eventsToFeatureCollection } from '../../util/osm.js'
import { OSM_GEOMETRY_LINE } from '../../util/osmCategories.js'
import { fetchOrgUnitNames, fetchOsmEvents } from './osmRequests.js'

const getFeatureStyle = ({ geometry, color }) =>
    geometry === OSM_GEOMETRY_LINE
        ? { strokeColor: color, weight: 3 }
        : { color, strokeColor: '#ffffff', pointSize: 6, weight: 1 }

const MAX_NAMES = 3

const uniqueEvents = (events) => [
    ...new Map(events.map((event) => [event.event, event])).values(),
]

// Events of the org units and their descendants, as an inline GeoJSON url,
// with their org unit names for the feature profile
const getOsmDataUrl = async (engine, programId, orgUnitIds) => {
    const events = uniqueEvents(
        (
            await Promise.all(
                orgUnitIds.map((orgUnitId) =>
                    fetchOsmEvents(engine, {
                        programId,
                        orgUnitId,
                        orgUnitMode: 'DESCENDANTS',
                    })
                )
            )
        ).flat()
    )
    const names = events.length
        ? await fetchOrgUnitNames(
              engine,
              events.map((event) => event.orgUnit)
          )
        : new Map()
    const geojson = eventsToFeatureCollection(
        events,
        (id) => names.get(id) ?? id
    )

    return {
        count: events.length,
        url: `data:application/geo+json,${encodeURIComponent(
            JSON.stringify(geojson)
        )}`,
    }
}

// "Bo, Kenema and 2 more"
export const getOrgUnitsLabel = (orgUnits) => {
    const names = orgUnits.map(({ name }) => name)
    if (names.length <= MAX_NAMES) {
        return names.join(', ')
    }
    return i18n.t('{{- names}} and {{count}} more', {
        names: names.slice(0, MAX_NAMES - 1).join(', '),
        count: names.length - MAX_NAMES + 1,
    })
}

// One GeoJSON layer config for the org units, or null if there is no data
export const getOsmLayer = async (engine, category, orgUnits) => {
    const { count, url } = await getOsmDataUrl(
        engine,
        category.program.id,
        orgUnits.map(({ id }) => id)
    )

    if (!count) {
        return null
    }

    const name = `OSM ${category.name}, ${getOrgUnitsLabel(orgUnits)}`

    return {
        layer: GEOJSON_URL_LAYER,
        name,
        config: {
            name,
            url,
            osmProgram: category.program.id,
            osmOrgUnits: orgUnits.map(({ id }) => id),
        },
        featureStyle: getFeatureStyle(category),
    }
}

// Reloaded copies of the OSM layers on the map for a program
export const getRefreshedOsmLayers = (engine, layers, programId) =>
    Promise.all(
        layers
            .filter(({ config }) => config?.osmProgram === programId)
            .map(async (layer) => {
                // Layers from before several areas have one org unit
                const { osmOrgUnits, osmOrgUnit } = layer.config
                const { url } = await getOsmDataUrl(
                    engine,
                    programId,
                    osmOrgUnits ?? [osmOrgUnit]
                )
                return {
                    ...layer,
                    config: { ...layer.config, url },
                    isLoaded: false,
                }
            })
    )
