const geoJsonUrlLoader = async (layer) => {
    const { name, url, featureStyle } = layer
    const legend = { title: name, items: [] }

    const geoJson = await fetch(url).then((response) => response.json())

    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        fillColor: featureStyle.color,
    })

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
