## About the Maps app { #about_maps }

The Maps app was introduced in release 2.29 as a replacement for the original GIS app, offering a
more intuitive and user-friendly interface. Since version 2.34, the mapping engine is based on WebGL
technology, capable of showing thousands of features on a map simultaneously.

> **Note**
>
> The Maps app requires WebGL. Visit [get.webgl.org](https://get.webgl.org) to verify that WebGL is
> working in your browser or to troubleshoot display issues.

With the Maps app, you can overlay multiple layers and choose from different basemaps. Supported
layer types include thematic maps, events, tracked entities, facilities, org unit boundaries, and
Earth Engine data such as population, elevation, or climate indicators. You can label features,
search and filter data, and save or share maps with other users, or download them as an image. Saved
maps can be added to dashboards in the **Dashboard** app. Thematic layers also integrate with the
**Data Visualizer** app, letting you open the same data as a chart.

> **Note**
>
> To use predefined legends in the **Maps** app, you need to create them first in the
> **Maintenance** app.

![](../resources/images/maps_main.png)

### Layers panel

The **layer panel** on the left side of the workspace shows an overview of the layers for the
current map:

-   As layers are added, using the **(+) Add layer** button, they are arranged and managed in this
    panel.

-   The **basemap** card is always shown at the bottom of the panel. See
    [Basemaps](#using_maps_basemaps) for available options.

-   The small arrow button to the right of the layer panel, at the top, allows the panel to be
    hidden or shown.

Each layer is represented by a card in the panel. Along the top of the card are a grab handle for
reordering layers with the mouse, the layer title, and an arrow to collapse or expand the card. The
middle of the card shows the layer legend where applicable. Along the bottom of the card from left
to right are:

-   An edit (pencil) button opens the layer configuration dialog.

-   An eye symbol toggles the visibility of the layer.

-   A slider modifies the layer transparency.

-   A more actions (three dots) button provides additional options, including showing or hiding the
    data table, downloading the layer data, and removing the layer.

### Map controls

-   The **+** and **-** buttons on the map allow you to zoom in and out of the map respectively. The
    mouse scroll wheel zoom is continuous, allowing you to fit the map perfectly to your content.

-   The **rotate map** button (triangle arrows) allows you to rotate and tilt the map to enhance the
    view of your data. Press and hold the button (or hold the Control key on your keyboard) while
    moving your mouse to change the map view. Click the button again to reset the view.

-   **Fullscreen** (four arrows) allows you to view the map in fullscreen. To exit fullscreen, click
    the button again or press the escape key on your keyboard.

-   **Zoom to content** (bounded magnifying glass symbol) automatically adjusts the zoom level and
    map center position to put the data on your map in focus.

-   **Search** (magnifying glass symbol) allows searching for and jumping to a location on the map.

-   The **ruler** button allows you to measure distances and areas on the map.

-   Right-click on the map to display the longitude and latitude of that location.

### File menu

-   The **File** button near the top left allows you to open and save maps. See
    [using the maps file menu](#using_maps_file_menu) for more detailed information.

-   The **Download** button next to the File button allows you to download the current map as a PNG
    image.

-   The **Interpretations** button at top right opens an interpretations panel on the right side of
    the workspace. See [viewing interpretations](#mapsInterpretation) for more information.
