## About the Maps app { #about_maps }

The Maps App was introduced in release 2.29 and serves as a replacement of the GIS App offering a
more intuitive and user-friendly interface. The mapping engine from version 2.34 is based on WebGL
technology, capable of showing thousands of features on a map simultaneously.

With the Maps app you can overlay multiple layers and choose among different basemaps. You can
create thematic maps of areas and points, view facilities based on classifications, and visualize
catchment areas for each facility. You can add labels to areas and points, and search and filter
using various criteria. You can move points and set locations on the fly. Maps can be saved and
shared with other users and groups, or downloaded as an image.

> **Note**
>
> To use predefined legends in the **Maps** app, you need to create them first in the
> **Maintenance** app.

![](../resources/images/maps_main.png)

-   The **layer panel** on the left side of the workspace shows an overview of the layers for the
    current map:

    -   As layers are added, using the **(+) Add layer** button, they are arranged and managed in
        this panel.

    -   The **basemap** card is always shown in the panel. The default available basemaps are
        OpenStreetMap Light (OSM Light), OpenStreetMap Detailed (OSM Detailed) and Sentinel-2
        Cloudless by EOX (Sentinel-2 EOX). The default selected basemap is OSM Light, unless a
        different basemap has been configured in the system settings. OSM Detailed contains more map
        features and place names. Sentinel-2 Cloudless is a cloud-free satellite imagery showing
        natural-color views of the Earth's surface with a 10m resolution.

        If the Azure or Bing Maps API key has been added by a system administrator, then there will
        be an additional 4 basemaps from Azure/Bing Maps. Road and Dark show roads, borders and
        places. Use the dark version if the colors on your map layers are bright. Aerial and Aerial
        Labels show satellite and detailed aerial imagery. Switch between them by selecting the
        desired image.

        _Note: Bing maps is being retired, see the announcement on the
        [Bing Maps Blog](https://aka.ms/BMERetirementAnnouncement). For migration to Azure Maps, you
        can consult the
        [Bing Maps Migration Overview](https://learn.microsoft.com/azure/azure-maps/migrate-bing-maps-overview)._

    -   The small arrow button to the right of the layer panel, at the top, allows the panel to be
        hidden or shown.

<!-- end list -->

-   The **File** button near the top left allows you to open and save maps. See
    [using the maps file menu](#using_maps_file_menu) for more detailed information.

<!-- end list -->

-   The **Download** button next to the File button allows you to download the current map as a PNG
    image.

<!-- end list -->

-   The **Interpretations** button at top right opens an interpretations panel on the right side of
    the workspace. See [viewing interpretations](#mapsInterpretation) for more information.

<!-- end list -->

-   The **+** and **-** buttons on the map allow you to zoom in and out of the map respectively. The
    mouse scroll wheel zoom is continuous, allowing us to fit the map perfectly to your content.

-   The **rotate map** button (triangle arrows) allows you to rotate and tilt the map to enhance the
    view of your data. Press and hold the button (or hold the Control key on your keyboard) while
    moving your mouse to change the map view. Click to button again to reset the view.

-   **Fullscreen** (four arrows) allows you to view the map in fullscreen. To exit fullscreen click
    the button again or the escape key on your keyboard.

-   **Zoom to content** (bounded magnifying glass symbol) automatically adjusts the zoom level and
    map center position to put the data on your map in focus.

-   **Search** (magnifying glass symbol) allows searching for and jumping to a location on the map.

-   The **ruler** button allows you to measure distances and areas on the map.

-   Right-click on the map to display the longitude and latitude of that location.

**Basemaps**

Basemap layers are represented by layer _cards_ in the layer panel such as:

![](../resources/images/maps_basemap_card.png)

Along the top of the basemap card from left to right are:

-   The title of the selected basemap

-   An arrow symbol to collapse and expand the basemap card

In the middle of the basemap card is the list of available basemaps. The current basemap is
highlighted.

Along the bottom of the basemap card is:

-   An eye symbol for toggling the visibility of the layer

-   A slider for modifying the layer transparency
