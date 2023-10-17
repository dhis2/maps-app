export const createSld = () => {
    const bounds = [0, 40, 60, 70, 80, 90, 120, 990]
    const colors = [
        '#ffffb2',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#f03b20',
        '#bd0026',
        '#CCCCCC',
    ]

    let sld = `<?xml version="1.0" encoding="UTF-8"?>
                <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se">
                  <NamedLayer>
                    <se:Name>JzqNgIsKF4N</se:Name>
                    <UserStyle>
                      <se:Name>JzqNgIsKF4N</se:Name>
                      <se:FeatureTypeStyle>`

    for (let i = 0; i < colors.length; i++) {
        const color = colors[i]
        const start = bounds[i]
        const stop = bounds[i + 1]

        const stopFilter = 'PropertyIsLessThan'

        /*
        if (i === colors.length - 1) {
            // If last
            let stopFilter = 'PropertyIsLessThanOrEqualTo';
        }
        */

        sld += `<se:Rule>
                  <se:Name>${start} - ${stop}</se:Name>
                  <se:Description>
                    <se:Title>${start} - ${stop}</se:Title>
                  </se:Description>
                  <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
                    <ogc:And>
                      <ogc:PropertyIsGreaterThanOrEqualTo>
                        <ogc:PropertyName>value</ogc:PropertyName>
                        <ogc:Literal>${start}</ogc:Literal>
                      </ogc:PropertyIsGreaterThanOrEqualTo>
                      <ogc:${stopFilter}>
                        <ogc:PropertyName>value</ogc:PropertyName>
                        <ogc:Literal>${stop}</ogc:Literal>
                      </ogc:${stopFilter}>
                    </ogc:And>
                  </ogc:Filter>
                  <se:PolygonSymbolizer>
                    <se:Fill>
                      <se:SvgParameter name="fill">${color}</se:SvgParameter>
                    </se:Fill>
                    <se:Stroke>
                      <se:SvgParameter name="stroke">#000000</se:SvgParameter>
                      <se:SvgParameter name="stroke-width">0.2</se:SvgParameter>
                      <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>
                    </se:Stroke>
                  </se:PolygonSymbolizer>
                </se:Rule>`
    }

    sld += `</se:FeatureTypeStyle>
              </UserStyle>
              </NamedLayer>
              </StyledLayerDescriptor>`

    return sld

    /*
    const blob = new Blob([sld], {type: 'application/xml;charset=utf-8'});

    FileSaver.saveAs(blob, layer.id + '.sld');
    */
}
