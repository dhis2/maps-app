const geoJsonUrlLoader = async (layer) => {
    const { name, featureStyle = {}, config } = layer

    const geoJson = await fetch(config.url).then((response) => response.json())

    const legend = { title: name, items: [] }
    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        fillColor: featureStyle.color,
    })

    const newConfig = layer.config
        ? { ...layer.config }
        : {
              url: layer.url,
              featureStyle: layer.featureStyle,
              name: layer.name,
          }

    return {
        ...layer,
        name,
        legend,
        data: geoJson?.features,
        config: newConfig,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    }
}

export default geoJsonUrlLoader
