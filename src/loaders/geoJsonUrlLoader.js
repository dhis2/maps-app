import { getInstance as getD2 } from 'd2'
import { getOrgUnitsFromRows } from '../util/analytics'
import { toGeoJson } from '../util/map'
import { getDisplayProperty } from '../util/helpers'

const geoJsonUrlLoader = async (layer) => {
    const { rows, name, url, where, featureStyle } = layer
    const legend = { title: name, items: [] }

    const geoJson = await fetch(url).then((response) => response.json())

    /*
    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        fillColor: featureStyle.color, // TODO: Clean up styles
    })
    */

    return {
        ...layer,
        name,
        legend,
        data: geoJson?.features,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    }
}

export default geoJsonUrlLoader
