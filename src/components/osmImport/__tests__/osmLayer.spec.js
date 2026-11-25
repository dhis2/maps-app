import { addOsmIcons, getOsmLegendItems } from '../osmLayer.js'
import { OSM_PROGRAMS } from '../osmMetadata.js'

const point = (properties) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties,
})

const health = OSM_PROGRAMS.health_facilities.id
const roads = OSM_PROGRAMS.roads.id
const pointItem = { name: 'Feature', type: 'Point', color: '#1b9e77' }

describe('osmLayer', () => {
    it('gives features the icon of their subcategory', () => {
        const [pharmacy, unknown] = addOsmIcons(
            [
                point({ tag: 'amenity=pharmacy' }),
                point({ tag: 'amenity=school' }),
            ],
            health
        )
        expect(pharmacy.properties.iconUrl).toBe('images/osm/pharmacies.png')
        expect(unknown.properties).not.toHaveProperty('iconUrl')
    })

    it('lists the subcategory icons on the layer, in category order', () => {
        const features = [
            point({ tag: 'amenity=pharmacy' }),
            point({ tag: 'amenity=hospital' }),
            point({ tag: 'healthcare=hospital' }),
        ]
        expect(getOsmLegendItems(features, health, [pointItem])).toEqual([
            { name: 'Hospitals', image: 'images/osm/hospitals.png' },
            { name: 'Pharmacies', image: 'images/osm/pharmacies.png' },
        ])
    })

    it('adds the circle as "Other" for features without an icon', () => {
        const features = [
            point({ tag: 'amenity=clinic' }),
            point({ type: 'unknown' }),
        ]
        expect(getOsmLegendItems(features, health, [pointItem])).toEqual([
            {
                name: 'Clinics and health centres',
                image: 'images/osm/clinics.png',
            },
            { ...pointItem, name: 'Other' },
        ])
    })

    it('keeps the legend of layers without icons', () => {
        const lineItem = { name: 'Feature', type: 'LineString' }
        const features = [point({ tag: 'highway=primary' })]
        expect(getOsmLegendItems(features, roads, [lineItem])).toEqual([
            lineItem,
        ])
    })
})
